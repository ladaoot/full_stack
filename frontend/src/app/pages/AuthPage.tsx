import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export const AuthPage = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword);
      toast.success('Вход выполнен успешно!');
      navigate('/');
    } catch (error) {
      toast.error('Ошибка входа. Проверьте данные.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(registerEmail, registerPassword, registerName);
      toast.success('Регистрация прошла успешно!');
      navigate('/');
    } catch (error) {
      toast.error('Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* <div className="text-black/60 text-sm mb-4">Вход</div> */}

      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardContent className="pt-4 pb-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="w-full bg-transparent p-0 h-auto rounded-none border-b border-black/20">
                <TabsTrigger
                  value="login"
                  className="flex-1 justify-start rounded-none border-0 px-0 py-3 text-base font-semibold text-black/80 data-[state=active]:text-black data-[state=active]:bg-transparent"
                >
                  Вход
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="flex-1 justify-end rounded-none border-0 px-0 py-3 text-base font-semibold text-black/50 data-[state=active]:text-black data-[state=active]:bg-transparent"
                >
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="pt-6">
                <form onSubmit={handleLogin} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-black/45 font-normal">
                      Электронная почта
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder=""
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="rounded-none border-0 border-b-2 border-black/70 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-black/45 font-normal">
                      Пароль
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder=""
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="rounded-none border-0 border-b-2 border-black/70 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-lg" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти в аккаунт'}
                  </Button>

                  <div className="flex items-center justify-between text-sm pt-4">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Забыли пароль?
                    </Button>
                    <div />
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="pt-6">
                <form onSubmit={handleRegister} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="register-name" className="text-black/45 font-normal">
                      Фамилия Имя Отчество
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder=""
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="rounded-none border-0 border-b-2 border-black/70 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-email" className="text-black/45 font-normal">
                      Электронная почта
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder=""
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="rounded-none border-0 border-b-2 border-black/70 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-password" className="text-black/45 font-normal">
                      Пароль
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder=""
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="rounded-none border-0 border-b-2 border-black/70 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-black"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-lg" disabled={isLoading}>
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
