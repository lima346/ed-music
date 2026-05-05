'use client';

import { useState } from 'react';
import { FiDownload, FiYoutube, FiMusic, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DownloadPage() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4'>('mp3');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      toast.error('Por favor, insira uma URL do YouTube');
      return;
    }

    if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
      toast.error('URL do YouTube inválida');
      return;
    }

    try {
      setIsDownloading(true);
      toast.loading(`Processando ${format.toUpperCase()}...`, { id: 'download' });
      
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format=${format}`;
      
      // Criar um link temporário para o download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.download = ''; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success('Seu download deve começar em breve!', { id: 'download' });
    } catch (error) {
      toast.error('Erro ao iniciar o download', { id: 'download' });
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 mt-10">
          <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-6">
            <FiYoutube className="text-4xl text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            YouTube Downloader
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Converta e baixe seus vídeos favoritos em alta qualidade. 
            Simples, rápido e gratuito.
          </p>
        </div>

        <div className="bg-zinc-900/40 p-6 md:p-10 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="space-y-8">
            {/* Input Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Cole o link do vídeo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FiYoutube className="h-6 w-6 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all text-lg shadow-inner"
                />
              </div>
            </div>

            {/* Format Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat('mp3')}
                className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                  format === 'mp3'
                    ? 'bg-red-500/10 border-red-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <FiMusic className={`text-3xl ${format === 'mp3' ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="font-bold text-lg">MP3 (Áudio)</span>
                  <span className="text-xs opacity-60">Alta Qualidade</span>
                </div>
                {format === 'mp3' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent pointer-events-none" />
                )}
              </button>

              <button
                onClick={() => setFormat('mp4')}
                className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                  format === 'mp4'
                    ? 'bg-red-500/10 border-red-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <FiVideo className={`text-3xl ${format === 'mp4' ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="font-bold text-lg">MP4 (Vídeo)</span>
                  <span className="text-xs opacity-60">HD Disponível</span>
                </div>
                {format === 'mp4' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent pointer-events-none" />
                )}
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading || !url}
              className="w-full relative group overflow-hidden bg-red-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              <div className="flex items-center justify-center gap-3">
                {isDownloading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <FiDownload className="text-2xl" />
                    <span>Baixar Agora</span>
                  </>
                )}
              </div>
            </button>

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-500 pt-4">
              Ao usar este serviço, você concorda que possui os direitos necessários sobre o conteúdo baixado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
