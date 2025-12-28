
import React, { useEffect, useState, useRef } from 'react';
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX,
  Pause, 
  Play, 
  Maximize2, 
  Minimize2,
  Settings,
  Loader2,
  X,
  Check,
  Type as TypeIcon,
  Video,
  Music,
  Maximize,
  RotateCcw,
  RotateCw,
  Plus,
  Minus,
  Crop,
  Zap
} from 'lucide-react';
import { Content } from '../types';

interface PlayerProps {
  item: Content;
  onClose: () => void;
  initialTime?: number;
  onProgress?: (time: number, duration: number) => void;
}

type AspectRatio = 'initial' | '16/9' | '4/3' | '21/9' | 'fill';

const Player: React.FC<PlayerProps> = ({ item, onClose, initialTime = 0, onProgress }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isYouTube, setIsYouTube] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'none' | 'subtitles' | 'video' | 'audio'>('none');
  
  // Advanced Video States
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('initial');
  const [zoom, setZoom] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Subtitle State
  const [subSize, setSubSize] = useState('24px');
  const [subColor, setSubColor] = useState('#ffffff');
  const [subFont, setSubFont] = useState("'Inter', sans-serif");
  const [externalSubUrl, setExternalSubUrl] = useState<string | null>(null);
  const [subFileName, setSubFileName] = useState<string | null>(null);
  const [subDelay, setSubDelay] = useState(0);

  const srtToVtt = (srtText: string) => {
    const vttText = 'WEBVTT\n\n' + srtText
      .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2')
      .replace(/\{\\([iba])\}/g, '<$1>')
      .replace(/\{\\([iba])0\}/g, '</$1>');
    return new Blob([vttText], { type: 'text/vtt' });
  };

  const handleSubtitleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const vttBlob = srtToVtt(text);
        if (externalSubUrl) URL.revokeObjectURL(externalSubUrl);
        const url = URL.createObjectURL(vttBlob);
        setExternalSubUrl(url);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--subtitle-size', subSize);
    document.documentElement.style.setProperty('--subtitle-color', subColor);
    document.documentElement.style.setProperty('--subtitle-font', subFont);
  }, [subSize, subColor, subFont]);

  useEffect(() => {
    const isYT = item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtube.com/embed') || item.provider === 'YouTube';
    setIsYouTube(isYT);
    if (isYT) setIsLoading(false);

    let timeout: any;
    const handleMove = () => {
      if (isMinimized) return;
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (activeMenu === 'none') setShowControls(false);
      }, 3000);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (activeMenu !== 'none') return;
        switch(e.key.toLowerCase()) {
            case ' ': e.preventDefault(); togglePlay(); break;
            case 'f': toggleFullscreen(); break;
            case 'm': toggleMute(); break;
            case 'arrowright': if(videoRef.current) videoRef.current.currentTime += 10; break;
            case 'arrowleft': if(videoRef.current) videoRef.current.currentTime -= 10; break;
        }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (externalSubUrl) URL.revokeObjectURL(externalSubUrl);
    };
  }, [item, isMinimized, activeMenu]);

  useEffect(() => {
    if (isYouTube) return;
    const saveProgress = () => {
      if (videoRef.current && onProgress) {
        const ct = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        if (!isNaN(ct) && !isNaN(dur) && dur > 0) onProgress(ct, dur);
      }
    };
    const interval = setInterval(() => isPlaying && saveProgress(), 5000);
    return () => { clearInterval(interval); saveProgress(); };
  }, [isPlaying, onProgress, isYouTube]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen();
      } else {
          document.exitFullscreen();
      }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const containerClasses = isMinimized 
    ? "fixed bottom-6 right-6 w-[340px] aspect-video z-[300] rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
    : "fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center overflow-hidden";

  const videoStyles: React.CSSProperties = {
      objectFit: aspectRatio === 'fill' ? 'fill' : (aspectRatio === 'initial' ? 'contain' : 'contain'),
      aspectRatio: aspectRatio === 'initial' || aspectRatio === 'fill' ? 'auto' : aspectRatio,
      transform: `scale(${zoom})`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div ref={containerRef} id="player-container" className={containerClasses}>
      <input type="file" ref={fileInputRef} accept=".srt,.vtt" className="hidden" onChange={handleSubtitleUpload} />

      {/* Header Overlay */}
      {!isMinimized && (
        <div className={`absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-500 z-[210] ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all shadow-xl backdrop-blur-md border border-white/5">
              <ChevronLeft size={24} />
            </button>
            <div className="hidden md:block">
              <p className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-0.5">Reproduzindo agora</p>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white">{item.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 bg-black/40 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 shadow-2xl">
             <div className="flex items-center gap-3 px-3 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-yellow-500 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input 
                  type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-28 transition-all duration-500 accent-yellow-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer appearance-none"
                />
             </div>
             <div className="w-px h-8 bg-white/10" />
             <button onClick={() => setIsMinimized(true)} className="p-3 hover:bg-white/10 rounded-xl transition-all text-neutral-400 hover:text-white">
               <Minimize2 size={20} />
             </button>
             <button onClick={toggleFullscreen} className="p-3 hover:bg-white/10 rounded-xl transition-all text-neutral-400 hover:text-white">
               <Maximize2 size={20} />
             </button>
             <button 
                onClick={() => setActiveMenu(activeMenu === 'none' ? 'video' : 'none')} 
                className={`p-3 rounded-xl transition-all ${activeMenu !== 'none' ? 'bg-yellow-500 text-black' : 'hover:bg-white/10 text-neutral-400 hover:text-white'}`}
             >
               <Settings size={20} />
             </button>
          </div>
        </div>
      )}

      {/* Loading Animation Aprimorada */}
      {isLoading && (
        <div className="absolute inset-0 z-[205] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative">
              <div className="w-24 h-24 border-4 border-yellow-500/20 rounded-full animate-ping absolute" />
              <div className="w-24 h-24 border-4 border-t-yellow-500 border-r-transparent border-b-yellow-500 border-l-transparent rounded-full animate-spin shadow-[0_0_20px_#facc15]" />
              <div className="absolute inset-0 flex items-center justify-center">
                 {/* Added missing Zap icon component */}
                 <Zap className="text-yellow-500 fill-yellow-500 animate-pulse" size={32} />
              </div>
          </div>
          <div className="mt-12 text-center space-y-2">
            <p className="text-white font-black text-xs uppercase tracking-[0.4em] animate-pulse">Sincronizando Buffers</p>
            <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest">Aguardando resposta do servidor P2P...</p>
          </div>
        </div>
      )}

      {/* Video Content */}
      <div className="w-full h-full relative" onClick={(!isYouTube && !isMinimized) ? togglePlay : undefined}>
        {isYouTube ? (
          <iframe
            className="w-full h-full"
            src={`${item.videoUrl.replace('watch?v=', 'embed/')}?autoplay=1&controls=1`}
            allow="autoplay; fullscreen; picture-in-picture"
          />
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            controls={false} // Usamos nossos controles customizados
            crossOrigin="anonymous"
            className="w-full h-full transition-all duration-500"
            style={videoStyles}
            src={item.videoUrl}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => {
              setDuration(videoRef.current?.duration || 0);
              if (initialTime > 0 && videoRef.current) videoRef.current.currentTime = initialTime;
              setIsLoading(false);
            }}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
          >
            {externalSubUrl && <track label="Legenda Externa" kind="subtitles" srclang="pt" src={externalSubUrl} default />}
          </video>
        )}

        {/* Play/Pause Center Overlay */}
        {!isYouTube && !isMinimized && showControls && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`p-8 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 transition-transform duration-500 ${isPlaying ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    <Play size={64} fill="currentColor" className="text-yellow-500" />
                </div>
            </div>
        )}
      </div>

      {/* Bottom Timeline Overlay */}
      {!isMinimized && !isYouTube && (
          <div className={`absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 z-[210] ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="max-w-7xl mx-auto space-y-6">
                  {/* Seek Bar */}
                  <div className="group relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      if (videoRef.current) videoRef.current.currentTime = percent * duration;
                  }}>
                      <div 
                        className="absolute h-full bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-100" 
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-yellow-500 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                      </div>
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                          <div className="flex items-center gap-4">
                              <button onClick={() => { if(videoRef.current) videoRef.current.currentTime -= 10 }} className="text-white hover:text-yellow-500 transition-colors"><RotateCcw size={24} /></button>
                              <button onClick={togglePlay} className="p-4 bg-yellow-500 text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20">
                                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                              </button>
                              <button onClick={() => { if(videoRef.current) videoRef.current.currentTime += 10 }} className="text-white hover:text-yellow-500 transition-colors"><RotateCw size={24} /></button>
                          </div>
                          <div className="text-[11px] font-black font-mono text-neutral-400 tracking-widest flex items-center gap-2">
                             <span className="text-white">{new Date(currentTime * 1000).toISOString().substr(11, 8)}</span>
                             <span className="text-neutral-700">/</span>
                             <span>{new Date(duration * 1000).toISOString().substr(11, 8)}</span>
                          </div>
                      </div>

                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">Auto Quality</span>
                         <span className="text-[10px] font-black uppercase text-green-500 tracking-widest bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/10">H/W Acceleration</span>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Advanced Settings Menu */}
      {activeMenu !== 'none' && (
        <div className="absolute inset-0 z-[220] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setActiveMenu('none')}>
           <div className="bg-[#0f0f0f] border border-neutral-800 p-10 rounded-[3rem] w-full max-w-2xl animate-in zoom-in-95 duration-300 shadow-[0_30px_60px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
              
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                <div className="flex gap-4">
                    {[
                        { id: 'video', label: 'VÍDEO', icon: Video },
                        { id: 'subtitles', label: 'LEGENDAS', icon: TypeIcon },
                        { id: 'audio', label: 'ÁUDIO', icon: Music }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveMenu(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMenu === tab.id ? 'bg-yellow-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
                <button onClick={() => setActiveMenu('none')} className="p-2 text-neutral-500 hover:text-white transition-colors"><X /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {activeMenu === 'video' && (
                  <>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2"><Crop size={14}/> Proporção da Tela</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['initial', '16/9', '4/3', '21/9', 'fill'] as AspectRatio[]).map(r => (
                                <button 
                                    key={r}
                                    onClick={() => setAspectRatio(r)}
                                    className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${aspectRatio === r ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}
                                >
                                    {r === 'initial' ? 'Original' : r === 'fill' ? 'Preencher' : r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2"><Maximize size={14}/> Zoom Dinâmico ({zoom.toFixed(1)}x)</label>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                            <button onClick={() => setZoom(Math.max(1, zoom - 0.1))} className="p-2 hover:text-yellow-500"><Minus size={18}/></button>
                            <input 
                                type="range" min="1" max="2" step="0.1" value={zoom} 
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 accent-yellow-500 appearance-none bg-neutral-800 h-1 rounded-full"
                            />
                            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:text-yellow-500"><Plus size={18}/></button>
                        </div>
                        <button onClick={() => setZoom(1)} className="w-full py-2 text-[8px] font-black text-neutral-500 uppercase hover:text-white">Resetar Zoom</button>
                    </div>
                  </>
                )}

                {activeMenu === 'subtitles' && (
                  <div className="col-span-full space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Carregar Arquivo Local</label>
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-500/20 transition-all flex items-center justify-center gap-3">
                                {subFileName ? <Check size={18} /> : <Plus size={18} />}
                                {subFileName ? subFileName : 'Selecionar .SRT ou .VTT'}
                            </button>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Delay de Sincronia ({subDelay}s)</label>
                            <div className="flex gap-2">
                                <button onClick={() => setSubDelay(d => Number((d - 0.1).toFixed(1)))} className="flex-1 bg-white/5 py-4 rounded-xl text-xs font-black">-0.1s</button>
                                <button onClick={() => setSubDelay(0)} className="flex-1 bg-white/5 py-4 rounded-xl text-[9px] font-black uppercase">Zerar</button>
                                <button onClick={() => setSubDelay(d => Number((d + 0.1).toFixed(1)))} className="flex-1 bg-white/5 py-4 rounded-xl text-xs font-black">+0.1s</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-neutral-600 uppercase">Tamanho</label>
                            <select value={subSize} onChange={e => setSubSize(e.target.value)} className="w-full bg-neutral-900 p-3 rounded-lg text-xs font-bold outline-none">
                                <option value="18px">Pequeno</option>
                                <option value="24px">Médio</option>
                                <option value="32px">Grande</option>
                                <option value="42px">Extra</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-neutral-600 uppercase">Cor</label>
                            <select value={subColor} onChange={e => setSubColor(e.target.value)} className="w-full bg-neutral-900 p-3 rounded-lg text-xs font-bold outline-none">
                                <option value="#ffffff">Branco</option>
                                <option value="#ffff00">Amarelo</option>
                                <option value="#00ff00">Verde</option>
                                <option value="#00ffff">Ciano</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-neutral-600 uppercase">Fonte</label>
                            <select value={subFont} onChange={e => setSubFont(e.target.value)} className="w-full bg-neutral-900 p-3 rounded-lg text-xs font-bold outline-none">
                                <option value="'Inter', sans-serif">Sans Serif</option>
                                <option value="'Roboto Mono', monospace">Monospace</option>
                                <option value="'Playfair Display', serif">Serif</option>
                            </select>
                        </div>
                    </div>
                  </div>
                )}

                {activeMenu === 'audio' && (
                    <div className="col-span-full py-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Music size={32} className="text-neutral-500" />
                        </div>
                        <p className="text-xs font-black uppercase text-white tracking-widest">Auto-seleção de Faixa</p>
                        <p className="text-[10px] text-neutral-500 font-medium max-w-xs mx-auto">O navegador está processando a trilha de áudio padrão do stream. Suporte para troca de canais (5.1/Stereo) depende do codec do arquivo original.</p>
                        <button className="mt-4 px-6 py-3 bg-neutral-800 rounded-xl text-[9px] font-black uppercase text-neutral-400">Ver detalhes técnicos</button>
                    </div>
                )}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-4">
                    <span>Engine: Lumina v2.5</span>
                    <span>Codec: H.264/AVC</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-500/50">
                    {/* Added missing Zap icon component */}
                    <Zap size={10} />
                    <span>Hardware Sync On</span>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Player;
