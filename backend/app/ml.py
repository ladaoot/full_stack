import torch
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification, T5ForConditionalGeneration, T5Tokenizer
import os
import fitz  # PyMuPDF
import logging

logger = logging.getLogger("ml")

class MLService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # NER model from local path
        ner_path = "app/models/ner/final"
        if os.path.exists(ner_path):
            logger.info(f"Loading NER model from local path: {ner_path}")
            self.ner_tokenizer = AutoTokenizer.from_pretrained(ner_path)
            self.ner_model = AutoModelForTokenClassification.from_pretrained(ner_path).to(self.device)
            # Use aggregation_strategy="simple" to automatically merge subwords into entities
            self.ner_pipeline = pipeline("ner", model=self.ner_model, tokenizer=self.ner_tokenizer, aggregation_strategy="simple", device=0 if self.device == "cuda" else -1)
        else:
            logger.warning(f"NER model path {ner_path} not found. Using fallback.")
            self.ner_pipeline = None

        # Summarization model
        summary_model_name = "cointegrated/rut5-small"
        local_summary_path = "app/models/summary"
        
        try:
            target_path = local_summary_path if os.path.exists(local_summary_path) else summary_model_name
            if os.path.exists(local_summary_path):
                logger.info(f"Loading summarization model from local path: {local_summary_path}")
            else:
                logger.info(f"Downloading/Loading summarization model from cache: {summary_model_name}")
                
            self.summary_tokenizer = T5Tokenizer.from_pretrained(target_path)
            self.summary_model = T5ForConditionalGeneration.from_pretrained(target_path).to(self.device)
        except Exception as e:
            logger.warning(f"Failed to load summarization model: {e}")
            self.summary_model = None
            self.summary_tokenizer = None

    def extract_text_from_pdf(self, file_content: bytes):
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    def extract_metadata(self, text: str):
        try:
            if not self.ner_pipeline:
                # Fallback if NER is not loaded
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                return {
                    "title": lines[0][:200] if lines else "Unknown",
                    "authors": [],
                    "year": 2024,
                    "abstract": self.summarize(text, max_length=100) if self.summary_model else (" ".join(lines[1:5]) if len(lines) > 1 else ""),
                    "journal": "",
                    "doi": ""
                }
            
            # Use tokenizer to truncate text to model's max length (usually 512)
            # to avoid "size of tensor a must match size of tensor b" error
            inputs = self.ner_tokenizer(
                text, # Take a chunk of text
                truncation=True, 
                max_length=512, 
                return_tensors="pt"
            )
            # Decode back to string to pass to pipeline (which will re-tokenize, but now it's safe length)
            truncated_text = self.ner_tokenizer.decode(inputs["input_ids"][0], skip_special_tokens=True)
            
            raw_entities = self.ner_pipeline(truncated_text)
            
            metadata = {
                "title": "",
                "authors": [],
                "year": 2024,
                "abstract": "",
                "journal": "",
                "doi": ""
            }
            
            # Heuristic for title: usually the first non-empty line
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            if lines:
                metadata["title"] = lines[0]

            # Better processing for aggregated entities
            for ent in raw_entities:
                label = ent['entity_group']
                word = ent['word'].strip()
                
                # Cleanup common artifacts
                word = word.replace('##', '') # Should not be needed with "simple" but just in case
                word = word.replace(' ', ' ') # Standardize spaces
                
                if not word or len(word) < 2:
                    continue
                
                if label == 'AUTHOR':
                    # Split if model merged multiple authors into one entity
                    if ',' in word:
                        for a in word.split(','):
                            if len(a.strip()) > 2:
                                metadata["authors"].append(a.strip())
                    else:
                        metadata["authors"].append(word)
                elif label == 'TITLE':
                    if not metadata["title"] or len(word) > len(metadata["title"]):
                        metadata["title"] = word
                elif label == 'JOURNAL':
                    metadata["journal"] = word
                elif label == 'INFO' or label == 'DOI':
                    # Extract DOI
                    if '10.' in word:
                        import re
                        doi_match = re.search(r'10\.\d{4,9}/[-._;()/:A-Z0-9]+', word, re.I)
                        if doi_match and not metadata["doi"]:
                            metadata["doi"] = doi_match.group()
                    
                    # Extract year if present
                    import re
                    year_match = re.search(r'\b(19|20)\d{2}\b', word)
                    if year_match and metadata["year"] == 2024:
                        metadata["year"] = int(year_match.group())

            # Summarize the rest of the text for abstract
            if self.summary_model:
                try:
                    # Для аннотации (abstract) используем лимит 100 слов
                    metadata["abstract"] = self.summarize(text[:2000], max_length=100)
                except Exception as e:
                    logger.error(f"Summarization error: {e}")
                    # Fallback to first few sentences
                    metadata["abstract"] = " ".join(lines[1:5]) if len(lines) > 1 else ""
            else:
                # No summary model, use first lines as fallback
                metadata["abstract"] = " ".join(lines[1:5]) if len(lines) > 1 else ""
            
            # Final clean up
            metadata["authors"] = list(dict.fromkeys([a for a in metadata["authors"] if len(a) > 2])) # preserve order
            if not metadata["title"] and lines:
                metadata["title"] = lines[0]
                
            return metadata
        except Exception as e:
            logger.error(f"Error in extract_metadata: {e}")
            # Fallback
            return {
                "title": text.split('\n')[0][:100] if text else "Unknown",
                "authors": [],
                "year": 2024,
                "abstract": "",
                "journal": f'{e}',
                "doi": ""
            }

    def summarize(self, text: str, max_length: int = 250):
        if not self.summary_model or not self.summary_tokenizer:
            return ""

        # Ускорение: берем только первые 3000 символов (обычно там введение/абстракт)
        # Этого достаточно для качественной суммаризации и значительно ускоряет процесс
        summary_text = text
        
        # Токенизация с ограничением длины
        input_ids = self.summary_tokenizer.encode(
            summary_text, 
            return_tensors="pt", 
            max_length=512, 
            truncation=True
        ).to(self.device)
        
        # Генерация с оптимизированными параметрами для скорости
        summary_ids = self.summary_model.generate(
            input_ids, 
            max_length=max_length, 
            min_length=30, 
            length_penalty=1.0, # Меньше штраф за длину = быстрее
            num_beams=2,        # Меньше лучей = быстрее (4 -> 2)
            early_stopping=True
        )
        
        summary = self.summary_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

ml_service = MLService()
