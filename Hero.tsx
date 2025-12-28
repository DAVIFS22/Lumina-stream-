
import React from 'react';
import { Play, Plus, Info } from 'lucide-react';
import { Content } from '../types.ts';
import StarRating from './StarRating.tsx';

interface HeroProps {
  item: Content;
  onPlay: (item: Content) => void;
  onInfo: (item: Content) => void;
  userRating?: number;
}

const Hero: React.FC<HeroProps> = ({ item, onPlay, onInfo, userRating }) => {
  const displayRating = userRating ? (item.rating! + userRating) / 2 : item.rating || 0;

  return (
    <div className="relative w-full h-[80vh] min-h-[600px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={item.thumbnail} 
          alt={item.title} 
          className="w-full h-full object-cover brightness-[0.5] scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 p-8 md:p-16 max-w-3xl space-y-6 animate-in slide-in-from-left-4 duration-1000">
        <div className="flex items-center gap-3">
           <span className="bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">Especial Lumina</span>
           <span className="text-neutral-500">•</span>
           <div className="flex items-center gap-2">
             <StarRating rating={displayRating} size={14} />
             <span className="text-yellow-500 text-xs font-bold">{displayRating.toFixed(1)}</span>
           </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white drop-shadow-2xl uppercase">
          {item.title}
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl line-clamp-2 leading-relaxed font-medium max-w-xl">
          {item.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-6">
           <button 
            onClick={() => onPlay(item)}
            className="flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-5 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-yellow-500/20"
           >
              <Play size={24} fill="currentColor" /> ASSISTIR AGORA
           </button>
           
           <button className="flex items-center gap-3 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white border border-white/10 px-8 py-5 rounded-2xl font-bold transition-all">
              <Plus size={24} /> MINHA LISTA
           </button>

           <button 
            onClick={() => onInfo(item)}
            className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-yellow-500 hover:text-black transition-all"
           >
              <Info size={24} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
