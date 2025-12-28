
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TmdbMovie {
  id: number;
  title?: string;
  name?: string; // Para séries
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string; // Para séries
  overview: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

export interface TmdbSeason {
  season_number: number;
  episode_count: number;
  name: string;
}

export interface TmdbEpisode {
  episode_number: number;
  name: string;
  overview: string;
}

async function searchMulti(apiKey: string, query: string): Promise<TmdbMovie[]> {
  if (!apiKey || !query) return [];
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR&include_adult=false`
    );
    const data = await response.json();
    return (data.results || []).filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
  } catch (error) {
    console.error("TMDb Multi Search Error:", error);
    return [];
  }
}

async function getExternalIds(apiKey: string, id: number, type: 'movie' | 'tv'): Promise<string | null> {
  if (!apiKey) return null;
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}/external_ids?api_key=${apiKey}`);
    const data = await response.json();
    return data.imdb_id || null;
  } catch (error) {
    console.error("TMDb External IDs Error:", error);
    return null;
  }
}

async function getTvDetails(apiKey: string, id: number): Promise<{ seasons: TmdbSeason[] }> {
  const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${apiKey}&language=pt-BR`);
  return response.json();
}

async function getTrending(apiKey: string): Promise<TmdbMovie[]> {
  if (!apiKey) return [];
  try {
    const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${apiKey}&language=pt-BR`);
    const data = await response.json();
    return (data.results || []).map((r: any) => ({ ...r, media_type: r.media_type || 'movie' }));
  } catch (error) {
    console.error("TMDb Trending Error:", error);
    return [];
  }
}

export const tmdbService = {
  searchMulti,
  getExternalIds,
  getTrending,
  getTvDetails
};
