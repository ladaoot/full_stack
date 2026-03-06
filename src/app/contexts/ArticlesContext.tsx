import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Article } from '../types';

interface ArticlesContextType {
  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  getArticleById: (id: string) => Article | undefined;
  getUserArticles: (userId: string) => Article[];
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export const useArticles = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within an ArticlesProvider');
  }
  return context;
};

// Mock данные для демонстрации
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Глубокое обучение для обработки естественного языка',
    authors: ['Иванов И.И.', 'Петров П.П.'],
    year: 2024,
    abstract: 'В данной статье рассматриваются современные подходы к применению глубокого обучения в задачах обработки естественного языка. Особое внимание уделяется трансформерным архитектурам и их применению в различных NLP задачах.',
    pdfFileName: 'deep_learning_nlp_2024.pdf',
    citations: [
      {
        id: 'c1',
        text: 'Трансформеры показали выдающиеся результаты в задачах машинного перевода',
        page: 5,
        createdAt: new Date('2024-01-15')
      }
    ],
    tags: [
      { id: 't1', name: 'NLP', color: '#3b82f6' },
      { id: 't2', name: 'Deep Learning', color: '#8b5cf6' },
      { id: 't3', name: 'Трансформеры', color: '#ec4899' }
    ],
    userId: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    doi: '10.1234/example.2024.001',
    journal: 'Журнал искусственного интеллекта',
    volume: '15',
    pages: '123-145'
  },
  {
    id: '2',
    title: 'Квантовые вычисления: современное состояние и перспективы',
    authors: ['Сидоров С.С.', 'Козлов К.К.', 'Морозова М.М.'],
    year: 2023,
    abstract: 'Обзор современных достижений в области квантовых вычислений. Рассматриваются основные подходы к созданию квантовых компьютеров и их потенциальные применения в криптографии и оптимизации.',
    pdfFileName: 'quantum_computing_2023.pdf',
    citations: [
      {
        id: 'c2',
        text: 'Квантовое превосходство было достигнуто в задачах случайной выборки',
        page: 12,
        createdAt: new Date('2023-11-20')
      },
      {
        id: 'c3',
        text: 'Основные проблемы связаны с декогеренцией кубитов',
        page: 8,
        createdAt: new Date('2023-11-20')
      }
    ],
    tags: [
      { id: 't4', name: 'Квантовые вычисления', color: '#10b981' },
      { id: 't5', name: 'Физика', color: '#f59e0b' },
      { id: 't6', name: 'Криптография', color: '#ef4444' }
    ],
    userId: '2',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2023-11-15'),
    doi: '10.1234/example.2023.042',
    journal: 'Физический журнал',
    volume: '78',
    pages: '234-267'
  },
  {
    id: '3',
    title: 'Методы машинного обучения в биоинформатике',
    authors: ['Новикова Н.Н.'],
    year: 2024,
    abstract: 'Исследование применения различных методов машинного обучения для анализа геномных данных. Приводятся примеры успешного использования нейронных сетей для предсказания структуры белков.',
    pdfFileName: 'ml_bioinformatics_2024.pdf',
    citations: [],
    tags: [
      { id: 't7', name: 'Биоинформатика', color: '#06b6d4' },
      { id: 't8', name: 'Machine Learning', color: '#8b5cf6' },
      { id: 't9', name: 'Геномика', color: '#14b8a6' }
    ],
    userId: '1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    journal: 'Биоинформатика сегодня',
    year: 2024
  }
];

export const ArticlesProvider = ({ children }: { children: ReactNode }) => {
  const [articles, setArticles] = useState<Article[]>(() => {
    const stored = localStorage.getItem('articles');
    return stored ? JSON.parse(stored, (key, value) => {
      // Преобразуем строки дат обратно в Date объекты
      if (key === 'createdAt' || key === 'updatedAt') {
        return new Date(value);
      }
      if (key === 'citations' && Array.isArray(value)) {
        return value.map(c => ({ ...c, createdAt: new Date(c.createdAt) }));
      }
      return value;
    }) : mockArticles;
  });

  useEffect(() => {
    localStorage.setItem('articles', JSON.stringify(articles));
  }, [articles]);

  const addArticle = (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArticle: Article = {
      ...article,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setArticles(prev => [newArticle, ...prev]);
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === id
          ? { ...article, ...updates, updatedAt: new Date() }
          : article
      )
    );
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(article => article.id !== id));
  };

  const getArticleById = (id: string) => {
    return articles.find(article => article.id === id);
  };

  const getUserArticles = (userId: string) => {
    return articles.filter(article => article.userId === userId);
  };

  return (
    <ArticlesContext.Provider
      value={{
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        getArticleById,
        getUserArticles
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
};
