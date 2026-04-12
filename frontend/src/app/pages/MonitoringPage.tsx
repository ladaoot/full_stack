import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { api } from '../utils/api';
import { logger } from '../utils/logger';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  Clock, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../components/ui/button';

interface SystemStats {
  system: {
    cpu_percent: number;
    memory: {
      total: number;
      available: number;
      percent: number;
    };
    disk: {
      total: number;
      free: number;
      percent: number;
    };
    uptime_seconds: number;
  };
  process: {
    cpu_percent: number;
    memory_rss: number;
    threads: number;
  };
  status: string;
}

export const MonitoringPage = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSystemStats();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      logger.error('Monitoring error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}ч ${m}м ${s}с`;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Мониторинг системы</h1>
            <p className="text-muted-foreground">
              Текущее состояние сервера и использование ресурсов в реальном времени.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Последнее обновление</p>
              <p className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <Button variant="outline" size="icon" onClick={fetchStats} disabled={isLoading}>
              <RefreshCcw className={`h-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant={stats?.status === 'online' ? 'default' : 'destructive'} className="h-8 px-3">
              {stats?.status === 'online' ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Offline
                </span>
              )}
            </Badge>
          </div>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Загрузка CPU</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.system.cpu_percent.toFixed(1)}%</div>
              <Progress value={stats?.system.cpu_percent} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Процесс: {stats?.process.cpu_percent.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          {/* Memory Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Оперативная память</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.system.memory.percent.toFixed(1)}%</div>
              <Progress value={stats?.system.memory.percent} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Свободно: {stats ? formatBytes(stats.system.memory.available) : '...'}
              </p>
            </CardContent>
          </Card>

          {/* Disk Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Дисковое пространство</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.system.disk.percent.toFixed(1)}%</div>
              <Progress value={stats?.system.disk.percent} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Свободно: {stats ? formatBytes(stats.system.disk.free) : '...'}
              </p>
            </CardContent>
          </Card>

          {/* Uptime Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Время работы</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? formatUptime(stats.system.uptime_seconds) : '...'}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Потоков процесса: {stats?.process.threads}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Детали процесса
              </CardTitle>
              <CardDescription>Информация о текущем процессе бэкенда</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Использование памяти (RSS)</span>
                <span className="font-medium">{stats ? formatBytes(stats.process.memory_rss) : '...'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Количество активных потоков</span>
                <span className="font-medium">{stats?.process.threads}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Статус API</span>
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Healthy</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Инструкции по мониторингу</CardTitle>
              <CardDescription>Как интерпретировать данные</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Загрузка CPU</strong> отображает суммарную нагрузку на все ядра процессора.</p>
              <p>• <strong>Оперативная память</strong> включает в себя кэш ОС и используемую приложениями память.</p>
              <p>• <strong>Время работы</strong> — это время с момента последнего перезапуска сервиса.</p>
              <p className="pt-4 italic text-xs text-center">Данные обновляются автоматически каждые 10 секунд.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
