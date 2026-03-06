import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  currentFileName?: string;
}

export const PDFUploader = ({ onFileSelect, onClear, currentFileName }: PDFUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(currentFileName || '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFileName(currentFileName || '');
  }, [currentFileName]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      setFileName(pdfFile.name);
      onFileSelect(pdfFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleClear = () => {
    setFileName('');
    if (onClear) {
      onClear();
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {!fileName ? (
        <>
          <Card
            className={`border-2 border-dashed transition-all ${
              isDragging
                ? 'border-black/60 bg-neutral-200'
                : 'border-black/25 hover:border-black/45 bg-white'
            } cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-black' : 'text-black/50'}`} />
              <p className="text-sm font-medium text-black/80 mb-1">
                Перетащите PDF файл сюда
              </p>
              <p className="text-xs text-black/55 mb-4">или нажмите для выбора</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-5"
                onClick={(e) => { e.stopPropagation(); openFileDialog(); }}
              >
                Выбрать файл
              </Button>
            </div>
          </Card>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </>
      ) : (
        <div className="space-y-2">
          <Card className="bg-neutral-200 border-black/30">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-black/20">
                  <FileText className="w-5 h-5 text-black/80" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">{fileName}</p>
                  <p className="text-xs text-black/60">PDF документ</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5"
                  onClick={() => inputRef.current?.click()}
                >
                  Изменить файл
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="gap-2 rounded-full px-4 text-red-700 hover:text-red-800 hover:bg-red-50 border-red-700/60"
                >
                  <X className="w-4 h-4" />
                  Удалить
                </Button>
              </div>
            </div>
          </Card>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      <p className="text-xs text-black/55">
        Поддерживаются только PDF файлы. Максимальный размер: 50 МБ
      </p>
    </div>
  );
};
