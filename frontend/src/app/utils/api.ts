import { logger } from './logger';

const API_URL = 'http://localhost:8080';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    logger.info(`Attempting login for: ${email}`);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      logger.error('Login failed', error);
      throw new Error(error.detail || 'Login failed');
    }
    logger.info('Login successful');
    return response.json();
  },

  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user info');
    return response.json();
  },

  extractMetadataFromPdf: async (file: File) => {
    logger.info(`Extracting metadata from PDF: ${file.name}`);
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/ml/extract-from-pdf`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Metadata extraction failed', error);
      throw new Error(error.detail || 'Failed to extract metadata');
    }

    logger.info('Metadata extraction successful');
    return response.json();
  },

  summarizeText: async (articleId: string) => {
    logger.info(`Summarizing article: ${articleId}`);
    const response = await fetch(`${API_URL}/ml/summarize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ article_id: articleId }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Summarization failed', error);
      throw new Error(error.detail || 'Failed to summarize text');
    }

    logger.info('Summarization successful');
    return response.blob();
  },

  uploadPdf: async (file: File) => {
    logger.info(`Uploading PDF: ${file.name}`);
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/files/upload-pdf`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('PDF upload failed', error);
      throw new Error(error.detail || 'Failed to upload PDF');
    }

    logger.info('PDF upload successful');
    return response.json();
  },

  // Articles
  getArticles: async () => {
    logger.info('Fetching articles');
    const response = await fetch(`${API_URL}/articles`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      logger.error('Failed to fetch articles');
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },

  getArticle: async (id: string) => {
    logger.info(`Fetching article: ${id}`);
    const response = await fetch(`${API_URL}/articles/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      logger.error(`Failed to fetch article: ${id}`);
      throw new Error('Failed to fetch article');
    }
    return response.json();
  },

  createArticle: async (article: any) => {
    logger.info('Creating article', { title: article.title });
    const response = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(article),
    });
    if (!response.ok) {
      logger.error('Failed to create article');
      throw new Error('Failed to create article');
    }
    logger.info('Article created successfully');
    return response.json();
  },

  updateArticle: async (id: string, article: any) => {
    logger.info(`Updating article: ${id}`);
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(article),
    });
    if (!response.ok) {
      logger.error(`Failed to update article: ${id}`);
      throw new Error('Failed to update article');
    }
    logger.info(`Article updated successfully: ${id}`);
    return response.json();
  },

  deleteArticle: async (id: string) => {
    logger.info(`Deleting article: ${id}`);
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      logger.error(`Failed to delete article: ${id}`);
      throw new Error('Failed to delete article');
    }
    logger.info(`Article deleted successfully: ${id}`);
    return response.json();
  },

  getSystemStats: async () => {
    const response = await fetch(`${API_URL}/system/stats`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch system stats');
    return response.json();
  },
};
