import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from './ui/badge';

export interface FilterState {
  search: string;
  tags: string[];
  sortBy: 'date' | 'title' | 'year';
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  availableTags: string[];
}

export const SearchFilters = ({ onFilterChange, availableTags }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    sortBy: 'date'
  });

  const hasTag = (tag: string) =>
    filters.tags.some(t => t.trim().toLowerCase() === tag.trim().toLowerCase());

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: 'date' | 'title' | 'year') => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleTag = (tag: string) => {
    const newTags = hasTag(tag)
      ? filters.tags.filter(t => t.trim().toLowerCase() !== tag.trim().toLowerCase())
      : [...filters.tags, tag];
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters: FilterState = {
      search: '',
      tags: [],
      sortBy: 'date'
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = filters.search || filters.tags.length > 0;

  return (
    <div className="bg-neutral-200 rounded-xl border-2 border-black/30 p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
          <Input
            type="text"
            placeholder="Поиск по названию"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-11 rounded-full bg-white border border-black/30 focus-visible:ring-0 focus-visible:border-black"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full border-black/50 px-4">
              <Filter className="w-4 h-4" />
              Теги
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <Label>Фильтр по тегам</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="cursor-pointer"
                    aria-pressed={hasTag(tag)}
                  >
                    <Badge
                      variant={hasTag(tag) ? 'secondary' : 'outline'}
                      className="hover:opacity-80 select-none"
                    >
                      {tag}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              value={filters.sortBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="rounded-full bg-white border border-black/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">По дате</SelectItem>
                <SelectItem value="title">По названию</SelectItem>
                <SelectItem value="year">По году</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-2 rounded-full"
          >
            <X className="w-4 h-4" />
            Сбросить
          </Button>
        )}
      </div>
      {filters.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="rounded-full border border-black/15 gap-1">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                aria-label={`Удалить тег ${tag}`}
                className="ml-1 hover:opacity-100 opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
