import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ArticlesProvider } from './contexts/ArticlesContext';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { AddArticlePage } from './pages/AddArticlePage';
import { EditArticlePage } from './pages/EditArticlePage';
import { MyArticlesPage } from './pages/MyArticlesPage';
import { ArticleViewPage } from './pages/ArticleViewPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { Toaster } from './components/ui/sonner';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// App Router Component
const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-articles"
        element={
          <ProtectedRoute>
            <MyArticlesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-article"
        element={
          <ProtectedRoute>
            <AddArticlePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-article/:id"
        element={
          <ProtectedRoute>
            <EditArticlePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/article/:id"
        element={
          <ProtectedRoute>
            <ArticleViewPage />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <MonitoringPage />
          </ProtectedRoute>
        }
      /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ArticlesProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </ArticlesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
