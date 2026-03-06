import React, { useState } from 'react';
import { Tag } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tags, Plus, X } from 'lucide-react';
import { Badge } from './ui/badge';

interface TagManagerProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const TAG_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
];

export const TagManager = ({ tags, onTagsChange }: TagManagerProps) => {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const handleAdd = () => {
    if (!newTagName.trim()) return;

    // Проверяем, не существует ли уже такой тег
    if (tags.some(t => t.name.toLowerCase() === newTagName.toLowerCase())) {
      return;
    }

    const tag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: selectedColor
    };

    onTagsChange([...tags, tag]);
    setNewTagName('');
    // Выбираем следующий цвет для нового тега
    const currentIndex = TAG_COLORS.indexOf(selectedColor);
    setSelectedColor(TAG_COLORS[(currentIndex + 1) % TAG_COLORS.length]);
  };

  const handleDelete = (id: string) => {
    onTagsChange(tags.filter(t => t.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-neutral-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tags className="w-5 h-5" />
            Теги
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new tag */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Название тега</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="tag-name"
                  type="text"
                  placeholder="Например: Machine Learning"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAdd}
                  disabled={!newTagName.trim()}
                  className="gap-2 rounded-full px-5"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </Button>
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label>Цвет тега</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tags list */}
          {tags.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Добавлено тегов:</span>
                <Badge variant="secondary">{tags.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="gap-2 pr-1 py-1.5 text-sm"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: tag.color
                    }}
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="hover:bg-white/50 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Tags className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Теги еще не добавлены</p>
              <p className="text-xs mt-1">Добавьте теги для категоризации статьи</p>
            </div>
          )}

          {/* Popular tags suggestions */}
          {tags.length === 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-600 mb-2">Популярные теги:</p>
              <div className="flex flex-wrap gap-2">
                {['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'AI'].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setNewTagName(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
