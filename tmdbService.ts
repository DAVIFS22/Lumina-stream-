const API_KEY = 'e3dfda3388c610113ab7b79441f4b652';
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbService = {
  async searchContent(query: string) {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`);
    return await response.json();
  },
  async getExternalIds(id: string, type: 'movie' | 'tv') {
    const response = await fetch(`${BASE_URL}/${type}/${id}/external_ids?api_key=${API_KEY}`);
    return await response.json();
  }
};
