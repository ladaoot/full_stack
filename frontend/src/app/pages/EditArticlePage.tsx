import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useArticles } from '../contexts/ArticlesContext';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { PDFUploader } from '../components/PDFUploader';
import { CitationManager } from '../components/CitationManager';
import { TagManager } from '../components/TagManager';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Save, ArrowLeft, AlertCircle, Trash2 } from 'lucide-react';
import { Citation, Tag } from '../types';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { Alert, AlertDescription } from '../components/ui/alert';

export const EditArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getArticleById, updateArticle, deleteArticle } = useArticles();
  const { user } = useAuth();

  const article = id ? getArticleById(id) : undefined;

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [doi, setDoi] = useState('');
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [pages, setPages] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setAbstract(article.abstract);
      setDoi(article.doi || '');
      setJournal(article.journal || '');
      setVolume(article.volume || '');
      setPages(article.pages || '');
      setCitations(article.citations);
      setTags(article.tags);
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !abstract) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!article || !id) {
      toast.error('Статья не найдена');
      return;
    }

    if (!user || article.userId !== user.id) {
      toast.error('У вас нет прав на редактирование этой статьи');
      return;
    }

    setIsSubmitting(true);

    try {
      updateArticle(id, {
        title,
        authors: article.authors,
        year: article.year,
        abstract,
        pdfFileName: pdfFile?.name || article.pdfFileName,
        doi: doi || undefined,
        journal: journal || undefined,
        volume: volume || undefined,
        pages: pages || undefined,
        citations,
        tags
      });

      toast.success('Статья успешно обновлена!');
      navigate('/my-articles');
    } catch (error) {
      toast.error('Ошибка при обновлении статьи');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Статья не найдена или была удалена
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button variant="outline" className="gap-2 rounded-full px-5" asChild>
              <Link to="/my-articles">
                <ArrowLeft className="w-4 h-4" />
                Вернуться к моим статьям
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (user && article.userId !== user.id) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              У вас нет прав на редактирование этой статьи
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link to="/my-articles">
              <Button variant="outline" className="gap-2 rounded-full px-5">
                <ArrowLeft className="w-4 h-4" />
                Вернуться к моим статьям
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

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
              Редактирование статьи
            </h1>
            <p className="text-black/60 mt-1">
              Обновите информацию о статье
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" form="edit-article-form" variant="outline" className="gap-2 rounded-full px-6">
              <Save className="w-4 h-4" />
              Сохранить
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full px-4 text-red-700 hover:text-red-800 hover:bg-red-50 border-red-700/60"
              onClick={() => {
                if (!id) return;
                deleteArticle(id);
                toast.success('Статья удалена');
                navigate('/my-articles');
              }}
            >
              <Trash2 className="w-4 h-4" />
              Удалить
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} id="edit-article-form" className="space-y-6">
          {/* PDF Upload */}
          <Card className="bg-neutral-100">
            <CardHeader>
              <CardTitle>PDF файл</CardTitle>
              <CardDescription>
                {article.pdfFileName
                  ? `Текущий файл: ${article.pdfFileName}`
                  : 'PDF файл не загружен'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFUploader
                onFileSelect={setPdfFile}
                onClear={() => setPdfFile(null)}
                currentFileName={article.pdfFileName}
              />
            </CardContent>
          </Card>

          {/* Article Information */}
          <Card className="bg-neutral-100">
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
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
