import React from 'react';
import { Article } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, Calendar, Users, Quote, Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

interface ArticleCardProps {
  article: Article;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export const ArticleCard = ({ article, showActions = false, onDelete }: ArticleCardProps) => {
  const navigate = useNavigate();
  const formattedDate = article.createdAt.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card
      className="hover:shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(`/article/${article.id}`)}
    >
      <CardHeader>
        <CardTitle className="text-xl mb-1 line-clamp-2">
          {article.title}
        </CardTitle>
        <CardDescription className="text-sm text-black/70 line-clamp-3">
          {article.abstract}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Бар с количеством цитат */}
        <div className="bg-neutral-200 rounded-full border border-black/20 px-3 py-1.5 flex items-center gap-2 text-sm text-black/70 w-full">
          <Quote className="w-4 h-4 flex-shrink-0" />
          <span>{article.citations.length} цитат(ы)</span>
          {/* <div className="ml-auto h-2 w-28 bg-white/70 rounded-full" /> */}
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="rounded-full border border-black/15"
                style={{
                  backgroundColor: tag.color ? `${tag.color}35` : undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-black/55">
            Добавлено {formattedDate}
          </span>

          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full px-4"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link to={`/edit-article/${article.id}`}>
                    <Edit className="w-3.5 h-3.5" />
                    Редактировать
                  </Link>
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full px-4 text-red-700 hover:text-red-800 hover:bg-red-50 border-red-700/60"
                    onClick={(e) => { e.stopPropagation(); onDelete(article.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Удалить
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
