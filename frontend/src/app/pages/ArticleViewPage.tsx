import React from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useArticles } from '../contexts/ArticlesContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  BookOpen,
  Quote,
  Edit,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const ArticleViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles } = useArticles();

  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <Layout>
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Статья не найдена
          </h3>
          <p className="text-gray-600 mb-6">
            Статья с указанным ID не существует
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </Layout>
    );
  }

  const formattedDate = article.createdAt.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleSaveMetadata = () => {
    const meta = {
      id: article.id,
      title: article.title,
      year: article.year,
      authors: article.authors,
      abstract: article.abstract,
      tags: article.tags.map(t => ({ id: t.id, name: t.name, color: t.color })),
      doi: article.doi,
      journal: article.journal,
      volume: article.volume,
      pages: article.pages,
      citations: article.citations.map(c => ({
        id: c.id,
        text: c.text,
        page: c.page,
        createdAt: c.createdAt
      })),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      pdfFileName: article.pdfFileName,
      pdfUrl: article.pdfUrl
    };
    const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = article.title.substring(0, 50).replace(/[^а-яА-Яa-zA-Z0-9\\s]/g, '');
    link.href = url;
    link.download = `metadata_${safeTitle || 'article'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Метаданные сохранены');
  };

  const handleDownloadAbstract = () => {
    // Формируем текст рефератa
    const abstractText = `
РЕФЕРАТ

Название: ${article.title}

Авторы: ${article.authors.join(', ')}

Год публикации: ${article.year}

${article.journal ? `Журнал: ${article.journal}${article.volume ? `, том ${article.volume}` : ''}${article.pages ? `, стр. ${article.pages}` : ''}` : ''}

${article.doi ? `DOI: ${article.doi}` : ''}

АННОТАЦИЯ:
${article.abstract}

${article.tags.length > 0 ? `\nКЛЮЧЕВЫЕ СЛОВА: ${article.tags.map(t => t.name).join(', ')}` : ''}

${article.citations.length > 0 ? `\n\nЦИТАТЫ:\n${article.citations.map((citation, index) => `\n${index + 1}. ${citation.text}${citation.page ? ` (стр. ${citation.page})` : ''}`).join('\n')}` : ''}

---
Реферат сгенерирован ${new Date().toLocaleDateString('ru-RU')}
    `.trim();

    // Создаем blob и скачиваем файл
    const blob = new Blob([abstractText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Формируем имя файла из названия статьи
    const fileName = `Реферат_${article.title.substring(0, 50).replace(/[^а-яА-Яa-zA-Z0-9\s]/g, '')}.txt`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Реферат успешно скачан');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <CardTitle className="text-3xl">{article.title}</CardTitle>
              
              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button form="add-article-form" variant="outline" className="gap-2 rounded-full px-6" asChild disabled={!article.pdfUrl}>
                  <a href={article.pdfUrl || '#'} download={article.pdfFileName}>
                    <Download className="w-4 h-4" />
                    Скачать
                  </a>
                </Button>
                <Button form="add-article-form" variant="outline" className="gap-2 rounded-full px-6" onClick={handleDownloadAbstract}>
                  Создать реферат
                </Button>
                <Button form="add-article-form" variant="outline" className="gap-2 rounded-full px-6" onClick={handleSaveMetadata}>
                  Собрать метаданные
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Abstract */}
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Аннотация</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.abstract}
              </p>
            </div>

            {/* Citations */}
            <CitationsBlock />

            {/* PDF Preview/Download */}
            {article.pdfUrl && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF документ
                  </h3>
                  <div className="bg-neutral-200 p-4 rounded-lg flex items-center justify-between border border-black/20">
                    <div>
                      <p className="font-medium text-black">{article.pdfFileName}</p>
                      <p className="text-sm text-black/70">PDF файл загружен</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={article.pdfUrl} download={article.pdfFileName}>
                        <Download className="w-4 h-4 mr-2" />
                        Скачать PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="text-xs text-gray-500">
              <p>Добавлено: {formattedDate}</p>
              <p>Последнее обновление: {article.updatedAt.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

function CitationsBlock() {
  const { id } = useParams<{ id: string }>();
  const { articles } = useArticles();
  const article = articles.find(a => a.id === id);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    setVisible(false);
  }, [id]);
  if (!article || article.citations.length === 0) return null;
  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
            <Quote className="w-4 h-4" />
            Цитаты ({article.citations.length})
          </h3>
          <Button variant="outline" onClick={() => setVisible(v => !v)}>
            {visible ? 'Скрыть' : 'Показать'}
          </Button>
        </div>
        {visible && (
          <div className="space-y-3">
            {article.citations.map((citation, index) => (
              <div
                key={citation.id}
                className="bg-neutral-200 p-4 rounded-lg border-l-4 border-black/30"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-gray-500 mt-0.5">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 italic">
                      "{citation.text}"
                    </p>
                    {citation.page && (
                      <p className="text-xs text-gray-500 mt-2">
                        Страница: {citation.page}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
