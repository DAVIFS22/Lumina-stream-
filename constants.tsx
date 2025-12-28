
import { Content, Addon } from './types.ts';

export const MOCK_CONTENT: Content[] = [
  // FILMES POPULARES / EM ALTA
  {
    id: 'm1',
    title: 'A Noite dos Mortos-Vivos',
    description: 'Um clássico absoluto do terror que definiu o gênero. Um grupo de pessoas se refugia em uma fazenda isolada cercada por mortos-vivos.',
    thumbnail: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600',
    source: 'Archive.org',
    type: 'movie',
    year: 1968,
    rating: 8.9,
    genre: ['Terror', 'Clássico'],
    provider: 'Internet Archive',
    videoUrl: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4'
  },
  {
    id: 'm3',
    title: 'Metrópolis (Remasterizado)',
    description: 'A obra-prima definitiva do expressionismo alemão. Uma visão futurista da luta de classes em uma metrópole distópica.',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600',
    source: 'Archive.org',
    type: 'movie',
    year: 1927,
    rating: 9.3,
    genre: ['Ficção Científica', 'Drama'],
    provider: 'Internet Archive',
    videoUrl: 'https://archive.org/download/Metropolis1927Remastered/Metropolis1927Remastered.mp4'
  },
  {
    id: 'm7',
    title: 'Charada',
    description: 'Um thriller romântico estrelado por Audrey Hepburn e Cary Grant. Mistério e comédia em Paris.',
    thumbnail: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&q=80&w=600',
    source: 'Archive.org',
    type: 'movie',
    year: 1963,
    rating: 8.7,
    genre: ['Mistério', 'Romance'],
    provider: 'Internet Archive',
    videoUrl: 'https://archive.org/download/Charade1963/Charade1963.mp4'
  },

  // CANAIS AO VIVO
  {
    id: 'c1',
    title: 'NASA TV Live',
    description: 'Transmissão oficial das profundezas do espaço e da Estação Espacial Internacional (ISS).',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600',
    source: 'YouTube',
    type: 'channel',
    year: 2024,
    rating: 9.8,
    genre: ['Ciência', 'Ao Vivo'],
    provider: 'YouTube',
    videoUrl: 'https://www.youtube.com/embed/21X5lGlDOfg'
  },
  {
    id: 'iptv1',
    title: 'TV Cultura (Oficial)',
    description: 'O melhor da programação educativa e cultural brasileira disponível 24h por dia.',
    thumbnail: 'https://images.unsplash.com/photo-1593784991095-a205039470b6?auto=format&fit=crop&q=80&w=600',
    source: 'YouTube',
    type: 'channel',
    year: 2024,
    rating: 9.0,
    genre: ['Educação', 'Cultura'],
    provider: 'IPTV Aberta',
    videoUrl: 'https://www.youtube.com/embed/S_vT_tqYqY0'
  }
];

export const MOCK_ADDONS: Addon[] = [
  {
    id: 'torrentio',
    name: 'Torrentio',
    description: 'Add-on de busca múltipla para filmes e séries. Agrega diversos provedores de torrent e scrapers.',
    icon: '⚙️',
    enabled: true,
    category: 'Comunidade',
    version: 'v0.0.14',
    author: 'Torrentio',
    legalNotice: 'O uso deste addon pode envolver protocolos P2P. Use de forma consciente.',
    supportedProviders: ['Torrentio']
  },
  {
    id: 'brazuca-torrent',
    name: 'Brazuca Torrent',
    description: 'Especializado em conteúdo dublado e legendado em Português (Brasil). Foco na comunidade brasileira.',
    icon: '🇧🇷',
    enabled: true,
    category: 'Comunidade',
    version: 'v1.2.0',
    author: 'Brazuca Team',
    legalNotice: 'Provedor comunitário de scrapers.',
    supportedProviders: ['Brazuca']
  },
  {
    id: 'cinemeta',
    name: 'Cinemeta',
    description: 'Metadados oficiais para filmes e séries globais. Garante sinopses e posters atualizados.',
    icon: '🎬',
    enabled: true,
    category: 'Oficial',
    version: 'v3.0.0',
    author: 'Stremio Team',
    legalNotice: 'Apenas metadados públicos.',
    supportedProviders: ['Global Metadata', 'Internet Archive', 'YouTube', 'IPTV Aberta']
  },
  {
    id: 'archive-org',
    name: 'Internet Archive',
    description: 'A maior biblioteca digital do mundo, focada em preservação e domínio público.',
    icon: '🏛️',
    enabled: true,
    category: 'Oficial',
    version: '2.1.0',
    author: 'Archive.org',
    legalNotice: 'Conteúdo em Domínio Público.',
    supportedProviders: ['Internet Archive']
  }
];
