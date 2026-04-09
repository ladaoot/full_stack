import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useArticles } from '../contexts/ArticlesContext';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { PDFUploader } from '../components/PDFUploader';
import { AIMetadataExtractor } from '../components/AIMetadataExtractor';
import { CitationManager } from '../components/CitationManager';
import { TagManager } from '../components/TagManager';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { Citation, Tag, AIMetadata } from '../types';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { api } from '../utils/api';

export const AddArticlePage = () => {
  const navigate = useNavigate();
  const { addArticle } = useArticles();
  const { user } = useAuth();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState<string[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [abstract, setAbstract] = useState('');
  const [doi, setDoi] = useState('');
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [pages, setPages] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMetadataExtracted = (metadata: AIMetadata) => {
    if (metadata.title) setTitle(metadata.title);
    if (metadata.abstract) setAbstract(metadata.abstract);
    if (metadata.doi) setDoi(metadata.doi);
    if (metadata.journal) setJournal(metadata.journal);
    if (metadata.authors) setAuthors(metadata.authors);
    if (metadata.year) setYear(metadata.year);
    
    // Автоматически создаем теги из ключевых слов
    if (metadata.keywords && metadata.keywords.length > 0) {
      const newTags: Tag[] = metadata.keywords.map((keyword, index) => ({
        id: `ai-tag-${index}`,
        name: keyword,
        color: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]
      }));
      setTags(newTags);
    }

    toast.success('Метаданные успешно извлечены!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !abstract) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!user) {
      toast.error('Необходима авторизация');
      return;
    }

    setIsSubmitting(true);

    try {
      let pdfUrl = '';
//       let s3Filename = '';

      if (pdfFile) {
        const uploadResponse = await api.uploadPdf(pdfFile);
        pdfUrl = uploadResponse.url;
//         s3Filename = uploadResponse.s3_filename;
      }

      await addArticle({
        title,
        authors: authors.filter(a => a.trim() !== ''),
        year: isNaN(year) ? new Date().getFullYear() : year,
        abstract,
        pdfFileName: pdfFile?.name,
        pdfUrl,
//         s3Filename,
        doi: doi || undefined,
        journal: journal || undefined,
        volume: volume || undefined,
        pages: pages || undefined,
        citations,
        tags,
        userId: user.id
      });

      toast.success('Статья успешно добавлена!');
      navigate('/my-articles');
    } catch (error: any) {
      console.error('Error submitting article:', error);
      toast.error(error.message || 'Ошибка при добавлении статьи');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="gap-2 rounded-full px-4" asChild>
            <Link to="/my-articles">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black">
              Добавление новой статьи
            </h1>
            <p className="text-black/60 mt-1">
              Загрузите PDF и заполните информацию о статье
            </p>
          </div>
          <Button type="submit" form="add-article-form" variant="outline" className="gap-2 rounded-full px-6">
            <Save className="w-4 h-4" />
            Сохранить
          </Button>
        </div>

        <form onSubmit={handleSubmit} id="add-article-form" className="space-y-6">
          {/* PDF Upload */}
          <Card className="bg-neutral-100">
            <CardHeader>
              <CardTitle>Шаг 1: Загрузка PDF файла</CardTitle>
              <CardDescription>
                Загрузите PDF файл научной статьи (опционально)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFUploader
                onFileSelect={setPdfFile}
                onClear={() => setPdfFile(null)}
              />
            </CardContent>
          </Card>

          {/* AI Metadata Extraction */}
          {pdfFile && (
            <AIMetadataExtractor
              pdfFile={pdfFile}
              onMetadataExtracted={handleMetadataExtracted}
            />
          )}

          {/* Article Information */}
          <Card className="bg-neutral-100">
            <CardHeader>
              <CardTitle>Шаг 2: Основная информация</CardTitle>
              <CardDescription>
                Заполните данные о статье
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Название статьи <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Введите полное название статьи"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authors">Авторы</Label>
                  <Input
                    id="authors"
                    type="text"
                    placeholder="Иванов И.И., Петров П.П."
                    value={authors.join(', ')}
                    onChange={(e) => setAuthors(e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">
                  Аннотация <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="abstract"
                  placeholder="Краткое содержание статьи..."
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  rows={5}
                  required
                />
              </div>

            </CardContent>
          </Card>

          {/* Citations */}
          <div id="citations">
            <CitationManager
              citations={citations}
              onCitationsChange={setCitations}
            />
          </div>

          {/* Tags */}
          <div id="tags">
            <TagManager tags={tags} onTagsChange={setTags} />
          </div>
        </form>
      </div>
    </Layout>
  );
};
