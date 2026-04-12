export interface User {
  id: string;
  email: string;
  name: string;
  affiliation?: string;
}

export interface Citation {
  id: string;
  text: string;
  page?: number;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Article {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  pdfUrl?: string;
  pdfFileName?: string;
  s3Filename?: string;
  citations: Citation[];
  tags: Tag[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  doi?: string;
  journal?: string;
  volume?: string;
  pages?: string;
}

export interface AIMetadata {
  title?: string;
  authors?: string[];
  year?: number;
  abstract?: string;
  doi?: string;
  journal?: string;
  keywords?: string[];
}
