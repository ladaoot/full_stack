import React, { useMemo, useState } from 'react';
import { useArticles } from '../contexts/ArticlesContext';
import { ArticleCard } from '../components/ArticleCard';
import { SearchFilters, FilterState } from '../components/SearchFilters';
import { Layout } from '../components/Layout';
import { Inbox } from 'lucide-react';

export const HomePage = () => {
  const { articles } = useArticles();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    sortBy: 'date'
  });

  // Получаем все уникальные теги
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach(article => {
      article.tags.forEach(tag => tagSet.add(tag.name));
    });
    return Array.from(tagSet).sort();
  }, [articles]);

  // Фильтрация и сортировка статей
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Поиск по тексту
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.authors.some(author => author.toLowerCase().includes(searchLower)) ||
          article.abstract.toLowerCase().includes(searchLower) ||
          article.journal?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по тегам (без учёта регистра)
    if (filters.tags.length > 0) {
      const selected = new Set(filters.tags.map(t => t.trim().toLowerCase()));
      result = result.filter(article => {
        return article.tags.some(tag => selected.has(tag.name.trim().toLowerCase()));
      });
    }

    // Сортировка
    switch (filters.sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        break;
      case 'year':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'date':
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return result;
  }, [articles, filters]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Библиотека научных статей</h1>
            <p className="text-black/60 mt-1">Всего статей: {articles.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilters
          onFilterChange={setFilters}
          availableTags={availableTags}
        />

        {/* Results */}
        <div>
          {filteredArticles.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-black/60">
                  Найдено статей: {filteredArticles.length}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Статьи не найдены
              </h3>
              <p className="text-gray-600 mb-6">
                Попробуйте изменить параметры поиска или фильтры
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
