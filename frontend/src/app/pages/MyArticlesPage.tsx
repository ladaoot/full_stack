import React from 'react';
import { useArticles } from '../contexts/ArticlesContext';
import { useAuth } from '../contexts/AuthContext';
import { ArticleCard } from '../components/ArticleCard';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Library, Plus, Inbox } from 'lucide-react';
import { Link } from 'react-router';
// удалена модалка удаления; удаление перенесено в редактор

export const MyArticlesPage = () => {
  const { user } = useAuth();
  const { articles } = useArticles();

  const userArticles = React.useMemo(() => {
    if (!user) return [];
    return articles.filter(article => article.userId === user.id);
  }, [articles, user]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Мои статьи</h1>
            <p className="text-black/60 mt-1">Всего статей: {userArticles.length}</p>
          </div>

          <Button variant="outline" className="gap-2 rounded-full px-5" asChild>
            <Link to="/add-article">
              <Plus className="w-4 h-4" />
              Добавить Статью
            </Link>
          </Button>
        </div>

        {/* Articles */}
        {userArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {userArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                showActions
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              У вас пока нет статей
            </h3>
            <p className="text-gray-600 mb-6">
              Начните добавлять свои научные работы в библиотеку
            </p>
            <Button variant="outline" className="gap-2 rounded-full px-5" asChild>
              <Link to="/add-article">
                <Plus className="w-4 h-4" />
                Добавить первую статью
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};
