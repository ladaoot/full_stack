import React, { useState } from 'react';
import { AIMetadata } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../utils/api';

interface AIMetadataExtractorProps {
  pdfFile: File | null;
  onMetadataExtracted: (metadata: AIMetadata) => void;
}

export const AIMetadataExtractor = ({
  pdfFile,
  onMetadataExtracted
}: AIMetadataExtractorProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = async () => {
    if (!pdfFile) return;

    setIsExtracting(true);
    setError(null);

    try {
      const metadata = await api.extractMetadataFromPdf(pdfFile);

      // Преобразование ответа API в формат AIMetadata
      const aiMetadata: AIMetadata = {
        title: metadata.title || '',
        authors: metadata.authors || [],
        year: metadata.year || new Date().getFullYear(),
        abstract: metadata.abstract || '',
        doi: metadata.doi || '',
        journal: metadata.journal || '',
        keywords: metadata.keywords || []
      };

      onMetadataExtracted(aiMetadata);
      setIsExtracted(true);
    } catch (err: any) {
      console.error('Error extracting metadata:', err);
      setError(err.message || 'Ошибка при извлечении метаданных. Попробуйте снова.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Автоматическое извлечение метаданных
        </CardTitle>
        <CardDescription>
          Используйте ИИ для автоматического извлечения названия, авторов, аннотации и других
          данных из PDF файла
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!pdfFile ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Сначала загрузите PDF файл для использования этой функции
            </AlertDescription>
          </Alert>
        ) : isExtracted ? (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Метаданные успешно извлечены! Проверьте и при необходимости отредактируйте
              заполненные поля.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              onClick={extractMetadata}
              disabled={isExtracting}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Извлечение метаданных...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Извлечь метаданные с помощью ИИ
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-600 space-y-1">
              <p>ИИ может автоматически определить:</p>
              <ul className="list-disc list-inside pl-2 space-y-0.5">
                <li>Название статьи</li>
                <li>Авторов</li>
                <li>Год публикации</li>
                <li>Аннотацию</li>
                <li>DOI и журнал</li>
                {/* <li>Ключевые слова для тегов</li> */}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
