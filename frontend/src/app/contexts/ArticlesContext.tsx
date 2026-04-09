import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Article } from '../types';
import { api } from '../utils/api';

interface ArticlesContextType {
  articles: Article[];
  isLoading: boolean;
  addArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  getArticleById: (id: string) => Article | undefined;
  getUserArticles: (userId: string) => Article[];
  refreshArticles: () => Promise<void>;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export const useArticles = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within an ArticlesProvider');
  }
  return context;
};

export const ArticlesProvider = ({ children }: { children: ReactNode }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshArticles = async () => {
    setIsLoading(true);
    try {
      const data = await api.getArticles();
      // Ensure dates are correctly parsed and fields are mapped
      const parsedArticles = data.map((a: any) => ({
        ...a,
        userId: a.user_id,
        pdfUrl: a.pdf_url,
        pdfFileName: a.pdf_filename,
        s3Filename: a.s3_filename,
        createdAt: new Date(a.created_at),
        updatedAt: new Date(a.updated_at),
        tags: a.tags?.map((t: any) => ({
          id: t.id,
          name: t.name,
          color: t.color
        })) || [],
        citations: a.citations?.map((c: any) => ({ ...c, createdAt: new Date(c.created_at || new Date()) })) || []
      }));
      setArticles(parsedArticles);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshArticles();
  }, []);

  const addArticle = async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const formattedArticle = {
        title: article.title,
        authors: article.authors,
        year: article.year,
        abstract: article.abstract,
        doi: article.doi,
        journal: article.journal,
        volume: article.volume,
        pages: article.pages,
        pdf_url: article.pdfUrl,
        pdf_filename: article.pdfFileName,
        s3_filename: (article as any).s3Filename,
        tags: article.tags.map(t => ({ name: t.name, color: t.color })),
        citations: article.citations.map(c => ({ text: c.text, page: c.page })),
        user_id: article.userId
      };
      const a = await api.createArticle(formattedArticle);
      const newArticle: Article = {
        ...a,
        userId: a.user_id,
        pdfUrl: a.pdf_url,
        pdfFileName: a.pdf_filename,
        s3Filename: a.s3_filename,
        createdAt: new Date(a.created_at),
        updatedAt: new Date(a.updated_at),
        tags: a.tags?.map((t: any) => ({
          id: t.id,
          name: t.name,
          color: t.color
        })) || [],
        citations: a.citations?.map((c: any) => ({ ...c, createdAt: new Date(c.created_at || new Date()) })) || []
      };
      setArticles(prev => [newArticle, ...prev]);
    } catch (error) {
      console.error('Failed to add article:', error);
      throw error;
    }
  };

  const updateArticle = async (id: string, updates: Partial<Article>) => {
    try {
      const formattedUpdates = {
        title: updates.title,
        authors: updates.authors,
        year: updates.year,
        abstract: updates.abstract,
        doi: updates.doi,
        journal: updates.journal,
        volume: updates.volume,
        pages: updates.pages,
        pdf_url: updates.pdfUrl,
        pdf_filename: updates.pdfFileName,
        s3_filename: (updates as any).s3Filename,
        tags: updates.tags?.map(t => ({ name: t.name, color: t.color })),
        citations: updates.citations?.map(c => ({ text: c.text, page: c.page }))
      };
      const a = await api.updateArticle(id, formattedUpdates);
      const updatedArticle: Article = {
        ...a,
        userId: a.user_id,
        pdfUrl: a.pdf_url,
        pdfFileName: a.pdf_filename,
        s3Filename: a.s3_filename,
        createdAt: new Date(a.created_at),
        updatedAt: new Date(a.updated_at),
        tags: a.tags?.map((t: any) => ({
          id: t.id,
          name: t.name,
          color: t.color
        })) || [],
        citations: a.citations?.map((c: any) => ({ ...c, createdAt: new Date(c.created_at || new Date()) })) || []
      };
      setArticles(prev =>
        prev.map(article =>
          article.id === id ? updatedArticle : article
        )
      );
    } catch (error) {
      console.error('Failed to update article:', error);
      throw error;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await api.deleteArticle(id);
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (error) {
      console.error('Failed to delete article:', error);
      throw error;
    }
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
        isLoading,
        addArticle,
        updateArticle,
        deleteArticle,
        getArticleById,
        getUserArticles,
        refreshArticles
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
};
