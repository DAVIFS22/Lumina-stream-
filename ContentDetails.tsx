
import React from 'react';
import { X, Play, Plus, Share2, Calendar, Bell, BellOff, Check } from 'lucide-react';
import { Content } from '../types.ts';
import StarRating from './StarRating.tsx';

interface ContentDetailsProps {
  item: Content;
  userRating?: number;
  onClose: () => void;
  onPlay: (item: Content) => void;
  onRate: (id: string, rating: number) => void;
  isSubscribed?: boolean;
  onSubscribe: (id: string) => void;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ 
  item, 
  userRating, 
  onClose, 
  onPlay, 
  onRate,
  isSubscribed = false,
  onSubscribe
}) => {
  const displayRating = userRating ? (item.rating! + userRating) / 2 : item.rating || 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#0f0f0f] rounded-[40px] overflow-hidden shadow-2xl border border-neutral-800 flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 bg-black/40 hover:bg-yellow-500 hover:text-black rounded-full text-white transition-all"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-2/5 relative">
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            className="w-full h-full object-cover min-h-[350px]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
        </div>

        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-yellow-500 text-black px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">{item.provider}</span>
              <span className="text-neutral-700">•</span>
              <span className="text-neutral-400 text-xs font-bold uppercase">{item.genre?.join(' • ')}</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{item.title}</h2>

            <div className="flex flex-wrap items-center gap-8 py-2 border-y border-neutral-800/50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-black text-neutral-500">Avaliação Média</span>
                <div className="flex items-center gap-2">
                  <StarRating rating={displayRating} size={20} />
                  <span className="text-yellow-500 font-black">{displayRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-black text-neutral-500">Ano</span>
                <div className="flex items-center gap-2 text-white font-black">
                  <Calendar size={16} className="text-yellow-500" />
                  <span>{item.year}</span>
                </div>
              </div>
            </div>

            <p className="text-neutral-400 text-lg leading-relaxed font-medium">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => onSubscribe(item.id)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  isSubscribed 
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                    : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
                }`}
              >
                {isSubscribed ? <BellOff size={18} /> : <Bell size={18} />}
                {isSubscribed ? 'Seguindo' : 'Seguir Canal'}
              </button>
              
              {isSubscribed && (
                <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-black animate-in fade-in slide-in-from-left-2">
                   <Check size={14} /> ALERTAS ATIVOS
                </div>
              )}
            </div>

            <div className="p-8 bg-yellow-500/5 rounded-3xl border border-yellow-500/10 space-y-4">
              <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest">Sua Nota</h4>
              <div className="flex items-center gap-6">
                <StarRating 
                  interactive 
                  rating={userRating || 0} 
                  size={36} 
                  onRate={(r) => onRate(item.id, r)} 
                />
                <span className="text-xs text-neutral-500 font-bold uppercase">
                  {userRating ? `${userRating}/5 estrelas` : 'Toque nas estrelas'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => onPlay(item)}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-5 rounded-2xl font-black transition-all shadow-xl shadow-yellow-500/10"
              >
                <Play size={20} fill="currentColor" /> ASSISTIR AGORA
              </button>
              <button className="p-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl transition-all">
                <Plus size={24} />
              </button>
              <button className="p-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl transition-all">
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetails;
