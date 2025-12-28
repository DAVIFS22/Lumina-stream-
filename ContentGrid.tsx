
import React, { useState } from 'react';
import { Content, PlaybackProgress } from '../types';
import { Play, Star, Heart, ChevronDown, ChevronUp, Info, Calendar, Clock } from 'lucide-react';

interface ContentGridProps {
  title: string;
  items: Content[];
  onSelect: (item: Content) => void;
  onInfo?: (item: Content) => void;
  userRatings?: Record<string, number>;
  progressData?: Record<string, PlaybackProgress>;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  title, 
  items, 
  onSelect, 
  onInfo,
  userRatings = {},
  progressData = {},
  favorites = [],
  onToggleFavorite
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="px-6 md:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black tracking-tight text-white uppercase">{title}</h2>
        <button className="text-sm font-bold text-neutral-500 hover:text-yellow-500 transition-colors">
          VER TUDO
        </button>
      </div>
      
      {items.length === 0 ? (
        <div className="py-20 text-center bg-neutral-900/20 rounded-3xl border border-dashed border-neutral-800">
           <p className="text-neutral-500 uppercase font-black text-[10px] tracking-widest">Nenhum conteúdo nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((item) => {
            const uRating = userRatings[item.id];
            const displayRating = uRating ? (item.rating! + uRating) / 2 : item.rating || 0;
            const progress = progressData[item.id];
            const progressPercent = progress ? (progress.progress / progress.duration) * 100 : 0;
            const isFavorite = favorites.includes(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div 
                key={item.id}
                className={`group relative transition-all duration-500 ${isExpanded ? 'col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-3 scale-[1.02] z-30' : 'z-10'}`}
              >
                <div className={`flex flex-col md:flex-row gap-6 bg-neutral-900/40 rounded-3xl border transition-all overflow-hidden ${isExpanded ? 'border-yellow-500/50 bg-neutral-900 shadow-2xl p-4 md:p-6' : 'border-neutral-800/50 hover:border-yellow-500/30'}`}>
                  
                  {/* Poster Section */}
                  <div 
                    onClick={() => toggleExpand(item.id)}
                    className={`relative cursor-pointer flex-shrink-0 ${isExpanded ? 'w-full md:w-48 aspect-[2/3]' : 'w-full aspect-[2/3]'}`}
                  >
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className={`w-full h-full object-cover transition-all duration-700 rounded-2xl ${isExpanded ? 'opacity-100 shadow-xl' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`}
                    />
                    
                    {/* Botão de Favorito (Coração) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(item.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-20 shadow-lg ${
                        isFavorite 
                          ? 'bg-yellow-500 text-black scale-110' 
                          : 'bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart size={16} fill={isFavorite ? "currentColor" : "none"} strokeWidth={isFavorite ? 0 : 2} />
                    </button>

                    {progress && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800/80">
                        <div 
                          className="h-full bg-yellow-500 shadow-[0_0_8px_#facc15]" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}

                    {/* Overlay de Ação Rápida */}
                    {!isExpanded && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              {item.provider}
                            </span>
                        </div>
                        <h3 className="text-sm font-bold line-clamp-2 text-white mb-3 uppercase tracking-tighter">
                            {item.title}
                        </h3>
                        <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                              className="flex-1 bg-yellow-500 text-black text-[10px] font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/10"
                            >
                              <Play size={12} fill="currentColor" /> {progress ? 'RETOMAR' : 'PLAY'}
                            </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content Section */}
                  {isExpanded && (
                    <div className="flex-1 flex flex-col space-y-4 animate-in slide-in-from-left-4 duration-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-black uppercase text-neutral-500 tracking-widest">
                            <span className="flex items-center gap-1.5 text-yellow-500"><Star size={12} fill="currentColor"/> {displayRating.toFixed(1)}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={12}/> {item.year}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12}/> {item.duration || 'N/A'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleExpand(item.id)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-neutral-500 hover:text-white"
                        >
                          <ChevronUp size={24} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.genre?.map(g => (
                          <span key={g} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-neutral-400">
                            {g}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-neutral-400 font-medium leading-relaxed line-clamp-4 md:line-clamp-6">
                        {item.description}
                      </p>

                      <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
                        <button 
                          onClick={() => onSelect(item)}
                          className="flex-1 bg-yellow-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10 active:scale-95"
                        >
                          <Play size={18} fill="currentColor" /> ASSISTIR AGORA
                        </button>
                        <button 
                          onClick={() => onInfo?.(item)}
                          className="px-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                        >
                          <Info size={18} /> DETALHES
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Standard Footer (only shown when NOT expanded) */}
                {!isExpanded && (
                  <div className="mt-3 px-1 flex items-center justify-between group-hover:text-yellow-500 transition-colors cursor-pointer" onClick={() => toggleExpand(item.id)}>
                    <div className="overflow-hidden">
                      <h4 className="text-[13px] font-black text-neutral-300 truncate uppercase tracking-tight">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-neutral-500 font-bold">{item.year}</span>
                        <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                        <div className="flex items-center gap-1">
                          <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] text-yellow-500 font-black">{displayRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={14} className="text-neutral-700 group-hover:text-yellow-500 transition-transform group-hover:translate-y-0.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ContentGrid;
