
export type ContentType = 'movie' | 'series' | 'channel' | 'local' | 'podcast' | 'news';

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  source: string;
  type: ContentType;
  duration?: string;
  year?: number;
  rating?: number;
  genre?: string[];
  provider: string;
  videoUrl: string;
}

export interface PlaybackProgress {
  contentId: string;
  progress: number; // em segundos
  duration: number; // em segundos
  lastUpdated: number;
}

export interface AppNotification {
  id: string;
  contentId: string;
  title: string;
  message: string;
  thumbnail: string;
  timestamp: number;
  read: boolean;
  type: 'new_content' | 'update' | 'system';
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  legalNotice: string;
  category: 'Oficial' | 'Comunidade' | 'IPTV' | 'Podcasts' | 'Externo';
  version: string;
  author: string;
  supportedProviders: string[];
  manifestUrl?: string; // URL do manifesto original
  isExternal?: boolean; // Define se foi instalado manualmente
}

export interface UserState {
  favorites: string[];
  subscriptions: string[]; // IDs de conteúdo ou Provedores seguidos
  history: { contentId: string; timestamp: number }[];
  continueWatching: PlaybackProgress[];
  installedAddons: string[];
}
