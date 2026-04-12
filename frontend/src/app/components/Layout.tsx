import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { BookOpen, Home, Plus, Library, LogOut, User, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Page */}
      <div className="min-h-screen bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <header className="bg-white border-b border-black/30 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-black" />
                  <span className="text-lg font-semibold text-black">
                    Научная библиотека
                  </span>
                </Link>

                <nav className="hidden md:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={[
                      "gap-2 rounded-full border-black/60 px-4",
                      isActive('/') ? "bg-neutral-200" : "bg-white",
                    ].join(" ")}
                    asChild
                  >
                    <Link to="/">
                      <Home className="w-4 h-4" />
                      Главная
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={[
                      "gap-2 rounded-full border-black/60 px-4",
                      isActive('/my-articles') ? "bg-neutral-200" : "bg-white",
                    ].join(" ")}
                    asChild
                  >
                    <Link to="/my-articles">
                      <Library className="w-4 h-4" />
                      Мои статьи
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={[
                      "gap-2 rounded-full border-black/60 px-4",
                      isActive('/monitoring') ? "bg-neutral-200" : "bg-white",
                    ].join(" ")}
                    asChild
                  >
                    <Link to="/monitoring">
                      <Activity className="w-4 h-4" />
                      Мониторинг
                    </Link>
                  </Button>
                </nav>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-black/80">
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 rounded-full border-black/60 px-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выход</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/20 px-4 py-2 z-50">
          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              size="sm"
              className={[
                "flex-col h-auto py-2 rounded-xl",
                isActive('/') ? "bg-neutral-200" : "bg-transparent",
              ].join(" ")}
              asChild
            >
              <Link to="/">
                <Home className="w-5 h-5" />
                <span className="text-xs mt-1">Главная</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={[
                "flex-col h-auto py-2 rounded-xl",
                isActive('/my-articles') ? "bg-neutral-200" : "bg-transparent",
              ].join(" ")}
              asChild
            >
              <Link to="/my-articles">
                <Library className="w-5 h-5" />
                <span className="text-xs mt-1">Мои</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={[
                "flex-col h-auto py-2 rounded-xl",
                isActive('/add-article') ? "bg-neutral-200" : "bg-transparent",
              ].join(" ")}
              asChild
            >
              <Link to="/add-article">
                <Plus className="w-5 h-5" />
                <span className="text-xs mt-1">Добавить</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={[
                "flex-col h-auto py-2 rounded-xl",
                isActive('/monitoring') ? "bg-neutral-200" : "bg-transparent",
              ].join(" ")}
              asChild
            >
              <Link to="/monitoring">
                <Activity className="w-5 h-5" />
                <span className="text-xs mt-1">Мониторинг</span>
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};