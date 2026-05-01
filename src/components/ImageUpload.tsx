'use client';

import { useState, useEffect } from 'react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 20 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileTypes, setFileTypes] = useState<{ [key: string]: string }>({});

  console.log('📸 ImageUpload - arquivos atuais:', images);

  // Função para verificar se o arquivo é vídeo (pela URL)
  const isVideoFile = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.MP4', '.WEBM', '.MOV', '.AVI'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  // Função para verificar duração do vídeo (máximo 30 SEGUNDOS)
  const validateVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 30) {
          setError(`❌ Vídeo "${file.name}" tem ${Math.round(duration)} segundos. Máximo permitido: 30 segundos`);
          resolve(false);
        } else {
          console.log(`✅ Vídeo "${file.name}" tem ${Math.round(duration)} segundos (válido)`);
          resolve(true);
        }
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        setError(`❌ Não foi possível validar a duração do vídeo "${file.name}"`);
        resolve(false);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Verificar o tipo de cada arquivo ao carregar
  useEffect(() => {
    const checkFileTypes = async () => {
      const newTypes: { [key: string]: string } = {};
      
      for (const url of images) {
        if (newTypes[url]) continue;
        
        const videoExt = ['.mp4', '.webm', '.mov', '.avi', '.MP4', '.WEBM', '.MOV', '.AVI'];
        if (videoExt.some(ext => url.toLowerCase().endsWith(ext))) {
          newTypes[url] = 'video';
        } else {
          newTypes[url] = 'image';
        }
      }
      
      setFileTypes(newTypes);
    };
    
    if (images.length > 0) {
      checkFileTypes();
    }
  }, [images]);

  const handleUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      setError(`Você só pode adicionar mais ${remainingSlots} arquivo(s)`);
      return;
    }

    setUploading(true);
    setError('');

    const uploadedUrls: string[] = [];

    for (const file of fileArray) {
      const isVideo = file.type.startsWith('video/');
      if (isVideo) {
        const isValid = await validateVideoDuration(file);
        if (!isValid) {
          setUploading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro no upload');
        }

        uploadedUrls.push(data.url);
        console.log(`✅ Upload concluído: ${data.url} (${data.type || (isVideo ? 'video' : 'image')})`);
      } catch (err: any) {
        console.error('❌ Erro no upload:', err);
        setError(err.message);
        setUploading(false);
        return;
      }
    }

    if (uploadedUrls.length > 0) {
      console.log('📸 Todos os arquivos enviados:', uploadedUrls);
      const novosArquivos = [...images, ...uploadedUrls];
      console.log('📸 Chamando onImagesChange com:', novosArquivos);
      onImagesChange(novosArquivos);
    }

    setUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    console.log('📸 Removendo arquivo índice:', index);
    const novosArquivos = images.filter((_, i) => i !== index);
    onImagesChange(novosArquivos);
  };

  const getFileType = (url: string): 'video' | 'image' => {
    if (fileTypes[url] === 'video') return 'video';
    const videoExt = ['.mp4', '.webm', '.mov', '.avi', '.MP4', '.WEBM', '.MOV', '.AVI'];
    if (videoExt.some(ext => url.toLowerCase().endsWith(ext))) {
      return 'video';
    }
    return 'image';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-wait' : ''}
        `}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
        />
        
        <div className="text-4xl mb-2">📸🎬</div>
        <p className="text-gray-600">
          {uploading ? 'Enviando arquivos...' : 'Arraste e solte suas fotos ou vídeos aqui ou clique para selecionar'}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Imagens: JPG, PNG, WEBP, GIF (máx. 5MB) | Vídeos: MP4, WEBM, MOV (máx. 20MB, até 30 segundos)
        </p>
        <p className="text-xs text-gray-400">
          {images.length}/{maxImages} arquivos utilizados
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-3 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((fileUrl, idx) => {
            const isVideo = getFileType(fileUrl) === 'video';
            return (
              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border shadow-sm group bg-gray-100">
                {isVideo ? (
                  <>
                    <video 
                      src={fileUrl} 
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-2xl">🎬</span>
                    </div>
                  </>
                ) : (
                  <img src={fileUrl} alt={`Arquivo ${idx + 1}`} className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition z-10"
                >
                  ×
                </button>
                {isVideo && (
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded flex items-center gap-1">
                    <span>🎬</span> <span>Vídeo</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}