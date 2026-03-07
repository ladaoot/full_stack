import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Ссылка для восстановления отправлена на почту');
    setIsLoading(false);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardContent className="pt-6 pb-8 space-y-8">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full px-4" onClick={() => navigate('/auth')}>
                <ArrowLeft className="w-4 h-4" />
                Назад
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Восстановление пароля</h1>
              <p className="text-black/60 mt-1">Укажите почту, мы отправим ссылку для сброса пароля.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Электронная почта</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-none border-0 border-b-2 border-black/70 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-black"
                />
              </div>
              <Button type="submit" className="w-full h-11 rounded-lg" disabled={isLoading}>
                {isLoading ? 'Отправка...' : 'Отправить ссылку'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
