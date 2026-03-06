import React, { useState } from 'react';
import { Citation } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Quote, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Badge } from './ui/badge';

interface CitationManagerProps {
  citations: Citation[];
  onCitationsChange: (citations: Citation[]) => void;
}

export const CitationManager = ({ citations, onCitationsChange }: CitationManagerProps) => {
  const [newCitation, setNewCitation] = useState('');
  const [newPage, setNewPage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editPage, setEditPage] = useState('');

  const handleAdd = () => {
    if (!newCitation.trim()) return;

    const citation: Citation = {
      id: Date.now().toString(),
      text: newCitation,
      page: newPage ? parseInt(newPage) : undefined,
      createdAt: new Date()
    };

    onCitationsChange([...citations, citation]);
    setNewCitation('');
    setNewPage('');
  };

  const handleDelete = (id: string) => {
    onCitationsChange(citations.filter(c => c.id !== id));
  };

  const startEdit = (citation: Citation) => {
    setEditingId(citation.id);
    setEditText(citation.text);
    setEditPage(citation.page?.toString() || '');
  };

  const saveEdit = (id: string) => {
    onCitationsChange(
      citations.map(c =>
        c.id === id
          ? {
              ...c,
              text: editText,
              page: editPage ? parseInt(editPage) : undefined
            }
          : c
      )
    );
    setEditingId(null);
    setEditText('');
    setEditPage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditPage('');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-neutral-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Quote className="w-5 h-5" />
            Цитаты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new citation */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="citation-text">Текст цитаты</Label>
              <Textarea
                id="citation-text"
                placeholder="Введите важную цитату из статьи..."
                value={newCitation}
                onChange={(e) => setNewCitation(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-xs space-y-2">
                <Label htmlFor="citation-page">Страница (опционально)</Label>
                <Input
                  id="citation-page"
                  type="number"
                  placeholder="Номер страницы"
                  value={newPage}
                  onChange={(e) => setNewPage(e.target.value)}
                  min="1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAdd}
                disabled={!newCitation.trim()}
                className="gap-2 rounded-full px-5"
              >
                <Plus className="w-4 h-4" />
                Добавить цитату
              </Button>
            </div>
          </div>

          {/* Citations list */}
          {citations.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Добавлено цитат:</span>
                <Badge variant="secondary">{citations.length}</Badge>
              </div>
              {citations.map((citation) => (
                <Card key={citation.id} className="bg-neutral-100 border-l-4 text-gray-700">
                  <CardContent className="p-4">
                    {editingId === citation.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            placeholder="Страница"
                            value={editPage}
                            onChange={(e) => setEditPage(e.target.value)}
                            className="w-32"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => saveEdit(citation.id)}
                              className="gap-2 rounded-full px-4"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Сохранить
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="gap-2 rounded-full px-4"
                            >
                              <X className="w-3.5 h-3.5" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-gray-700 flex-1 italic">
                            "{citation.text}"
                          </p>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(citation)}
                              className="rounded-full"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(citation.id)}
                              className="text-red-700 hover:text-red-800 hover:bg-red-50 border-red-700/60 rounded-full"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {citation.page && (
                          <p className="text-xs text-gray-500">
                            Страница {citation.page}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Quote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Цитаты еще не добавлены</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
