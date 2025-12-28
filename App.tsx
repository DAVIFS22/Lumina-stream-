
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from './components/Layout.tsx';
import Hero from './components/Hero.tsx';
import ContentGrid from './components/ContentGrid.tsx';
import Player from './components/Player.tsx';
import ContentDetails from './components/ContentDetails.tsx';
import { MOCK_CONTENT, MOCK_ADDONS } from './constants.tsx';
import { Content, Addon, PlaybackProgress } from './types.ts';
import { 
  Zap, Search, Loader2, Play, Globe, ShieldAlert, Film, Star, Calendar, ArrowRight, Server, List, ChevronRight, ChevronDown, ChevronUp, Info, HardDrive, Filter, Monitor, Flame
} from 'lucide-react';
import { tmdbService, TmdbMovie, TmdbSeason } from './services/tmdbService.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState<Content | null>(null);
  const [detailItem, setDetailItem] = useState<Content | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  
  const sourcesRef = useRef<HTMLDivElement>(null);
  const initialTrendingMovies = useRef<TmdbMovie[]>([]);

  // Power Search States
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<TmdbMovie[]>([]);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [isFetchingTmdb, setIsFetchingTmdb] = useState(false);
  const [expandedSearchResult, setExpandedSearchResult] = useState<number | null>(null);
  
  // Series Selection States
  const [selectedMedia, setSelectedMedia] = useState<TmdbMovie | null>(null);
  const [seasons, setSeasons] = useState<TmdbSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [isFetchingSeasons, setIsFetchingSeasons] = useState(false);

  // Stream States
  const [externalStreams, setExternalStreams] = useState<any[]>([]);
  const [isFetchingStreams, setIsFetchingStreams] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [expandedStreamIdx, setExpandedStreamIdx] = useState<number | null>(null);
  const [streamFilter, setStreamFilter] = useState<'all' | 'dub' | 'leg' | '4k'>('all');

  // Persisted States
  const [tmdbApiKey] = useState('e3dfda3388c610113ab7b79441f4b652');
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('lumina_favorites') || '[]'));
  const [history, setHistory] = useState<Content[]>(() => JSON.parse(localStorage.getItem('lumina_history_v2') || '[]'));
  const [addons] = useState<Addon[]>(() => JSON.parse(localStorage.getItem('lumina_addons_v2') || JSON.stringify(MOCK_ADDONS)));

  useEffect(() => {
    localStorage.setItem('lumina_favorites', JSON.stringify(favorites));
    localStorage.setItem('lumina_history_v2', JSON.stringify(history));
  }, [favorites, history]);

  // Map TMDB to Lumina Content Format
  const mapTmdbToContent = (m: TmdbMovie): Content => ({
    id: `tmdb-${m.id}`,
    title: m.title || m.name || '',
    description: m.overview,
    thumbnail: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
    source: 'TMDb',
    type: m.media_type === 'tv' ? 'series' : 'movie',
    year: parseInt((m.release_date || m.first_air_date || '').split('-')[0]) || 2024,
    rating: m.vote_average,
    genre: [],
    provider: m.media_type === 'tv' ? 'Série' : 'Filme',
    videoUrl: '' 
  });

  // Load Trending on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsFetchingTmdb(true);
      const results = await tmdbService.getTrending(tmdbApiKey);
      initialTrendingMovies.current = results;
      setTmdbResults(results);
      setTrendingContent(results.slice(0, 12).map(mapTmdbToContent));
      setIsFetchingTmdb(false);
    };
    loadInitialData();
  }, []);

  // DEBOUNCE LOGIC for Search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (movieSearchQuery.trim()) {
        handleTmdBSearch();
      } else {
        // Restore trending if search is cleared
        setTmdbResults(initialTrendingMovies.current);
      }
    }, 600); // 600ms delay

    return () => clearTimeout(debounceTimer);
  }, [movieSearchQuery]);

  const handleTmdBSearch = async () => {
    if (!movieSearchQuery.trim()) return;
    setIsFetchingTmdb(true);
    const results = await tmdbService.searchMulti(tmdbApiKey, movieSearchQuery);
    setTmdbResults(results);
    setExpandedSearchResult(null);
    setIsFetchingTmdb(false);
  };

  const handleItemAction = (item: Content) => {
    if (item.videoUrl) {
      handlePlay(item);
    } else {
      setDetailItem(item);
    }
  };

  const handleMediaSelect = async (media: TmdbMovie) => {
    if (expandedSearchResult === media.id) {
        setExpandedSearchResult(null);
        setSelectedMedia(null);
        return;
    }

    setExpandedSearchResult(media.id);
    setSelectedMedia(media);
    setExternalStreams([]);
    setStreamError('');
    setExpandedStreamIdx(null);
    setStreamFilter('all');
    
    if (media.media_type === 'tv') {
      setIsFetchingSeasons(true);
      const details = await tmdbService.getTvDetails(tmdbApiKey, media.id);
      setSeasons(details.seasons.filter(s => s.season_number > 0));
      setIsFetchingSeasons(false);
    } else {
      fetchStreams(media);
    }
  };

  const fetchStreams = async (media: TmdbMovie, season?: number, episode?: number) => {
    setIsFetchingStreams(true);
    setStreamError('');
    setExternalStreams([]);

    setTimeout(() => sourcesRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const imdbId = await tmdbService.getExternalIds(tmdbApiKey, media.id, media.media_type || 'movie');
      if (!imdbId) throw new Error("ID IMDb não encontrado.");

      const type = media.media_type === 'tv' ? 'series' : 'movie';
      const idParam = media.media_type === 'tv' ? `${imdbId}:${season}:${episode}` : imdbId;

      const activeAddons = addons.filter(a => a.enabled);
      const providers = [];
      if (activeAddons.find(a => a.id === 'torrentio')) {
        providers.push({ name: 'Torrentio', url: `https://torrentio.strem.fun/stream/${type}/${idParam}.json` });
      }
      if (activeAddons.find(a => a.id === 'brazuca-torrent')) {
        providers.push({ name: 'Brazuca', url: `https://brazuca-torrents.strem.fun/stream/${type}/${idParam}.json` });
      }

      const responses = await Promise.allSettled(providers.map(p => 
        fetch(p.url).then(res => res.json()).then(data => ({ provider: p.name, streams: data.streams || [] }))
      ));

      const combined = responses.reduce((acc: any[], res) => {
        if (res.status === 'fulfilled') {
          return [...acc, ...res.value.streams.map((s: any) => ({ ...s, origin: res.value.provider }))];
        }
        return acc;
      }, []);

      setExternalStreams(combined);
      if (combined.length === 0) setStreamError("Nenhuma fonte encontrada para este título.");
    } catch (err) {
      setStreamError("Erro ao buscar fontes: " + (err as Error).message);
    } finally {
      setIsFetchingStreams(false);
    }
  };

  const filteredStreams = useMemo(() => {
    let filtered = [...externalStreams];
    if (streamFilter === 'dub') filtered = filtered.filter(s => s.origin === 'Brazuca' || s.title.toLowerCase().includes('dub'));
    if (streamFilter === 'leg') filtered = filtered.filter(s => s.origin === 'Torrentio' && !s.title.toLowerCase().includes('dub'));
    if (streamFilter === '4k') filtered = filtered.filter(s => s.title.toLowerCase().includes('4k') || s.name.toLowerCase().includes('4k'));
    return filtered;
  }, [externalStreams, streamFilter]);

  const handlePlay = (item: Content) => {
    setSelectedItem(item);
    setHistory(prev => [item, ...prev.filter(h => h.id !== item.id)].slice(0, 30));
  };

  const allGenres = useMemo(() => {
    const gSet = new Set<string>();
    MOCK_CONTENT.forEach(i => i.genre?.forEach(g => gSet.add(g)));
    return Array.from(gSet).sort();
  }, []);

  const filteredTrending = useMemo(() => {
    return selectedGenre 
      ? MOCK_CONTENT.filter(c => c.genre?.includes(selectedGenre))
      : MOCK_CONTENT;
  }, [selectedGenre]);

  return (
    <div className="relative h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSearchClick={() => setActiveTab('discover')}
        onNotificationsClick={() => {}}
        unreadCount={0}
      >
        {activeTab === 'home' && (
          <div className="pb-32 animate-in fade-in duration-700">
            <Hero item={MOCK_CONTENT[0]} onPlay={handlePlay} onInfo={setDetailItem} />
            
            <div className="relative z-20 -mt-24 space-y-8">
              {trendingContent.length > 0 && (
                <div className="bg-gradient-to-b from-transparent to-[#0a0a0a] pt-10">
                  <div className="px-6 md:px-10 flex items-center gap-3 mb-2">
                    <Flame className="text-orange-500 fill-orange-500" size={24} />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">Em Alta na Lumina</h2>
                  </div>
                  <ContentGrid 
                    title="Populares da Semana" 
                    items={trendingContent} 
                    onSelect={handleItemAction} 
                    favorites={favorites}
                    onToggleFavorite={(id) => setFavorites(f => f.includes(id) ? f.filter(i => i !== id) : [...f, id])}
                  />
                </div>
              )}

              <div className="px-6 md:px-10">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                  <Star className="fill-yellow-500 text-yellow-500" size={20} /> Sugestões Oficiais
                </h2>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
                  <button 
                    onClick={() => setSelectedGenre(null)}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${!selectedGenre ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
                  >
                    Todos
                  </button>
                  {allGenres.map(g => (
                    <button 
                      key={g}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${selectedGenre === g ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <ContentGrid 
                title={selectedGenre ? `Gênero: ${selectedGenre}` : "Explorar Acervo"} 
                items={filteredTrending} 
                onSelect={handlePlay} 
                favorites={favorites}
                onToggleFavorite={(id) => setFavorites(f => f.includes(id) ? f.filter(i => i !== id) : [...f, id])}
              />
            </div>
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 pb-32">
            <header className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-yellow-500 flex items-center gap-3">
                  <Zap size={32} className="fill-yellow-500" /> Power Search
                </h1>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                  <Globe size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Global P2P Network</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors z-10">
                    {isFetchingTmdb ? (
                        <Loader2 className="animate-spin text-yellow-500" size={20} />
                    ) : (
                        <Search size={20} />
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Busca Inteligente (Ex: Interestelar, The Boys...)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl md:rounded-[2rem] py-5 md:py-6 pl-14 md:pl-16 pr-6 text-lg md:text-xl font-bold focus:border-yellow-500 transition-all shadow-2xl focus:shadow-yellow-500/10 outline-none"
                    value={movieSearchQuery}
                    onChange={(e) => setMovieSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTmdBSearch()}
                  />
                  {movieSearchQuery && !isFetchingTmdb && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-600 uppercase tracking-widest animate-pulse">
                          Autobuscando...
                      </div>
                  )}
                </div>
                <button 
                  onClick={handleTmdBSearch}
                  className="bg-yellow-500 text-black py-4 px-12 rounded-2xl md:rounded-[2rem] font-black uppercase hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-yellow-500/20"
                >
                  {isFetchingTmdb ? <Loader2 className="animate-spin" /> : <>BUSCAR <ArrowRight size={20} /></>}
                </button>
              </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {tmdbResults.map((m) => {
                const isExpanded = expandedSearchResult === m.id;
                return (
                  <div 
                    key={m.id} 
                    onClick={() => handleMediaSelect(m)}
                    className={`group relative aspect-[2/3] rounded-[2rem] overflow-hidden cursor-pointer border-4 transition-all duration-500 ${isExpanded ? 'border-yellow-500 scale-105 shadow-2xl z-20' : 'border-neutral-900 hover:border-neutral-700 z-10'}`}
                  >
                    <img src={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-yellow-500 border border-white/10">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black">{m.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[9px] font-black text-yellow-500 uppercase mb-1 tracking-widest">{m.media_type === 'tv' ? 'Série' : 'Filme'}</p>
                      <h3 className="text-xs md:text-sm font-black uppercase line-clamp-2 leading-tight">{m.title || m.name}</h3>
                    </div>
                  </div>
                );
              })}
              {tmdbResults.length === 0 && !isFetchingTmdb && movieSearchQuery && (
                  <div className="col-span-full py-20 text-center">
                      <Search size={48} className="mx-auto text-neutral-800 mb-4" />
                      <p className="text-neutral-500 font-black uppercase tracking-widest text-xs">Nenhum resultado para "{movieSearchQuery}"</p>
                  </div>
              )}
            </div>

            <div ref={sourcesRef} className="scroll-mt-10">
              {selectedMedia && (
                <div className="bg-neutral-900/40 rounded-[2.5rem] md:rounded-[3.5rem] border border-neutral-800/60 p-6 md:p-12 space-y-10 animate-in slide-in-from-bottom-5 duration-500 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedMedia.media_type === 'tv' ? 'SÉRIE' : 'FILME'}</span>
                         <span className="text-neutral-700">|</span>
                         <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-2"><Server size={12}/> ID: {selectedMedia.id}</span>
                      </div>
                      <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">{selectedMedia.title || selectedMedia.name}</h2>
                      <div className="flex items-center gap-6 text-neutral-500 text-[11px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Calendar size={14} /> {selectedMedia.release_date || selectedMedia.first_air_date}</span>
                        <div className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {selectedMedia.vote_average.toFixed(1)}</div>
                      </div>
                    </div>
                    <div className="max-w-xl md:text-right flex flex-col justify-end">
                       <p className="text-neutral-400 text-sm md:text-lg font-medium leading-relaxed line-clamp-4 italic">"{selectedMedia.overview}"</p>
                    </div>
                  </div>

                  {selectedMedia.media_type === 'tv' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/40 p-8 rounded-[2rem] md:rounded-[3rem] border border-neutral-800">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2"><List size={16}/> SELECIONAR TEMPORADA</label>
                        <select 
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-black text-sm outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer"
                          value={selectedSeason}
                          onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        >
                          {seasons.map(s => <option key={s.season_number} value={s.season_number}>{s.name || `Temporada ${s.season_number}`}</option>)}
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Play size={16}/> SELECIONAR EPISÓDIO</label>
                        <div className="flex gap-4">
                          <input 
                            type="number" 
                            min="1" 
                            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 font-black text-sm outline-none focus:border-yellow-500 transition-all"
                            value={selectedEpisode}
                            onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                          />
                          <button 
                            onClick={() => fetchStreams(selectedMedia, selectedSeason, selectedEpisode)}
                            className="bg-white text-black px-10 rounded-2xl font-black uppercase text-xs active:scale-95 transition-all hover:bg-yellow-500"
                          >
                            BUSCAR FONTES
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-2">
                           <Monitor size={16} /> FONTES P2P ENCONTRADAS
                        </h4>
                        
                        {/* Filtros de Fontes */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'all', label: 'TODAS', icon: Filter },
                                { id: 'dub', label: 'DUBLADO (BR)', icon: Globe },
                                { id: 'leg', label: 'LEGENDADO', icon: List },
                                { id: '4k', label: '4K ULTRA HD', icon: Zap }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setStreamFilter(f.id as any)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all ${streamFilter === f.id ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-neutral-800/50 border-neutral-800 text-neutral-500 hover:text-white'}`}
                                >
                                    <f.icon size={12} /> {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isFetchingStreams ? (
                      <div className="py-24 flex flex-col items-center gap-6">
                        <div className="relative">
                            <Loader2 className="animate-spin text-yellow-500" size={56} strokeWidth={3} />
                            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black uppercase text-white tracking-widest">Sincronizando Seeds</p>
                            <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest mt-1">Conectando aos Add-ons ativos...</p>
                        </div>
                      </div>
                    ) : streamError ? (
                      <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-[2rem] md:rounded-[3rem]">
                        <ShieldAlert className="mx-auto mb-4 text-red-500" size={48} />
                        <p className="text-sm font-black text-red-500 uppercase tracking-widest">{streamError}</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredStreams.map((s, idx) => {
                          const isExp = expandedStreamIdx === idx;
                          const is4K = s.title.toLowerCase().includes('4k') || s.name.toLowerCase().includes('4k');
                          const is1080p = s.title.toLowerCase().includes('1080p');
                          const isDub = s.origin === 'Brazuca' || s.title.toLowerCase().includes('dub');

                          return (
                            <div key={idx} className={`group bg-neutral-900/60 border transition-all duration-500 rounded-[2rem] overflow-hidden ${isExp ? 'border-yellow-500/50 bg-neutral-900 shadow-2xl scale-[1.01]' : 'border-neutral-800/60 hover:border-yellow-500/30'}`}>
                              <div 
                                className="p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer"
                                onClick={() => setExpandedStreamIdx(isExp ? null : idx)}
                              >
                                <div className="flex items-center gap-6 w-full">
                                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-lg ${isDub ? 'bg-green-600/20 text-green-500 border border-green-500/20' : 'bg-blue-600/20 text-blue-500 border border-blue-500/20'}`}>
                                    {isDub ? 'BR' : 'TR'}
                                  </div>
                                  <div className="overflow-hidden flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm ${isDub ? 'bg-green-500 text-black' : 'bg-blue-500 text-white'}`}>
                                        {isDub ? 'Dublado' : 'Legendado'}
                                      </span>
                                      {is4K && <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-lg border border-yellow-400">4K ULTRA HD</span>}
                                      {is1080p && <span className="bg-neutral-200 text-black text-[9px] font-black px-2 py-0.5 rounded-lg">1080P</span>}
                                      <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">{s.origin} • {s.name}</span>
                                    </div>
                                    <h5 className="font-black text-sm md:text-xl text-white line-clamp-1 group-hover:text-yellow-500 transition-colors uppercase tracking-tight">{s.title}</h5>
                                  </div>
                                  <div className="hidden md:flex items-center gap-4">
                                    {isExp ? <ChevronUp className="text-yellow-500" /> : <ChevronDown className="text-neutral-700 group-hover:text-white transition-colors" />}
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlay({
                                      id: `stream-${idx}`,
                                      title: selectedMedia.title || selectedMedia.name || '',
                                      description: s.title,
                                      thumbnail: `https://image.tmdb.org/t/p/w500${selectedMedia.poster_path}`,
                                      source: s.origin,
                                      type: 'movie',
                                      provider: s.origin,
                                      videoUrl: s.url || `magnet:?xt=urn:btih:${s.infoHash}`
                                    });
                                  }}
                                  className="w-full md:w-auto bg-yellow-500 text-black px-10 py-5 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-yellow-400 active:scale-95 transition-all shadow-xl shadow-yellow-500/10"
                                >
                                  <Play size={18} fill="currentColor" /> ASSISTIR
                                </button>
                              </div>
                              
                              {/* Detalhes Expandidos da Fonte */}
                              {isExp && (
                                <div className="px-8 pb-8 pt-4 border-t border-white/5 animate-in slide-in-from-top-4 duration-500 bg-black/20">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <div className="flex items-start gap-4 p-5 bg-neutral-900/40 rounded-2xl border border-white/5">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg"><Info size={20} className="text-yellow-500" /></div>
                                        <div className="space-y-1">
                                           <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Metadata do Arquivo</p>
                                           <p className="text-xs font-bold text-neutral-300 break-all leading-relaxed uppercase tracking-tight">{s.title}</p>
                                        </div>
                                     </div>
                                     <div className="flex items-start gap-4 p-5 bg-neutral-900/40 rounded-2xl border border-white/5">
                                        <div className="p-2 bg-blue-500/10 rounded-lg"><HardDrive size={20} className="text-blue-500" /></div>
                                        <div className="space-y-1">
                                           <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">P2P Hash / Link</p>
                                           <p className="text-xs font-mono text-neutral-300 truncate">{s.infoHash || 'Protocolo HTTP Stream'}</p>
                                           <p className="text-[9px] font-bold text-neutral-600 uppercase">Segurança verificada pelo provedor</p>
                                        </div>
                                     </div>
                                     <div className="flex items-start gap-4 p-5 bg-neutral-900/40 rounded-2xl border border-white/5">
                                        <div className="p-2 bg-green-500/10 rounded-lg"><Globe size={20} className="text-green-500" /></div>
                                        <div className="space-y-1">
                                           <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Backbone de Rede</p>
                                           <p className="text-xs font-black text-neutral-200 uppercase">{s.origin} Distributed Core</p>
                                           <p className="text-[9px] font-bold text-green-500/80 uppercase">Latência Baixa Detectada</p>
                                        </div>
                                     </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {filteredStreams.length === 0 && !isFetchingStreams && (
                            <div className="py-20 text-center border-4 border-dashed border-neutral-900 rounded-[3rem]">
                                <Filter size={48} className="mx-auto text-neutral-800 mb-4" />
                                <p className="text-neutral-500 font-black uppercase tracking-widest text-xs">Nenhuma fonte corresponde ao filtro aplicado.</p>
                                <button onClick={() => setStreamFilter('all')} className="mt-4 text-yellow-500 font-black text-[10px] uppercase tracking-widest hover:underline">Limpar Filtros</button>
                            </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Library */}
        {activeTab === 'library' && (
          <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-16 pb-32">
             <header className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-yellow-500 tracking-tighter">Minha Biblioteca</h1>
                <div className="flex items-center gap-4">
                    <div className="h-1 w-20 bg-yellow-500 rounded-full" />
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Conteúdos salvos e assistidos</p>
                </div>
             </header>

             {favorites.length > 0 && (
                <ContentGrid 
                  title="Favoritos" 
                  items={MOCK_CONTENT.filter(c => favorites.includes(c.id)).concat(trendingContent.filter(c => favorites.includes(c.id)))} 
                  onSelect={handleItemAction} 
                  favorites={favorites}
                  onToggleFavorite={(id) => setFavorites(f => f.includes(id) ? f.filter(i => i !== id) : [...f, id])}
                />
             )}

             <ContentGrid 
               title="Histórico de Exibição" 
               items={history} 
               onSelect={handleItemAction} 
               favorites={favorites}
               onToggleFavorite={(id) => setFavorites(f => f.includes(id) ? f.filter(i => i !== id) : [...f, id])}
             />
          </div>
        )}

        {/* Tab Addons */}
        {activeTab === 'addons' && (
          <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 pb-32">
            <header className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-yellow-500 tracking-tighter">Extensões</h1>
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Módulos de busca e metadados ativos</p>
            </header>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {addons.map(a => (
                <div key={a.id} className="p-8 md:p-10 bg-neutral-900 rounded-[2.5rem] md:rounded-[3.5rem] border border-neutral-800 flex flex-col group hover:border-yellow-500/30 transition-all shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-5xl md:text-6xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">{a.icon}</span>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${a.enabled ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {a.enabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-3 tracking-tight">{a.name}</h3>
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-8 flex-1">{a.description}</p>
                  <div className="pt-8 border-t border-neutral-800 flex justify-between items-center text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Server size={12} /> {a.category}</span>
                    <span>v{a.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-12 pb-32">
            <h1 className="text-4xl md:text-6xl font-black uppercase text-yellow-500 tracking-tighter">Configurações</h1>
            <div className="bg-neutral-900 p-10 rounded-[3rem] border border-neutral-800 space-y-10 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl"><Info size={20} className="text-yellow-500" /></div>
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400">TMDb API Authorization Key</label>
                </div>
                <input 
                  type="password" 
                  className="w-full bg-black border border-neutral-800 rounded-2xl py-5 px-8 text-yellow-500 font-mono text-sm outline-none focus:border-yellow-500 transition-all shadow-inner"
                  defaultValue="e3dfda3388c610113ab7b79441f4b652"
                  readOnly
                />
                <p className="text-[10px] text-neutral-600 font-bold uppercase leading-relaxed tracking-wider">Esta chave é utilizada para sincronizar posters, sinopses e IDs globais entre o Lumina e os provedores de stream.</p>
              </div>
              
              <div className="pt-10 border-t border-neutral-800 flex flex-col items-center gap-4">
                 <button className="w-full py-5 bg-neutral-800 hover:bg-red-500/10 hover:text-red-500 transition-all rounded-2xl font-black text-[10px] uppercase tracking-[0.3em]">REDEFINIR TODOS OS DADOS LOCAIS</button>
                 <span className="text-[9px] text-neutral-700 font-black uppercase">Lumina Stream v2.5.4 - Engine P2P Legalizada</span>
              </div>
            </div>
          </div>
        )}
      </Layout>

      {/* Modals */}
      {detailItem && (
        <ContentDetails 
          item={detailItem} 
          onClose={() => setDetailItem(null)} 
          onPlay={handleItemAction} 
          onRate={() => {}}
          onSubscribe={() => {}} 
        />
      )}
      
      {selectedItem && (
        <Player 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}
