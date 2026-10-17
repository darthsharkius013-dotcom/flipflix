export type Genre = 
  | 'Action' 
  | 'Sci-Fi' 
  | 'Anime' 
  | 'Comedy' 
  | 'Horror' 
  | 'Fantasy' 
  | 'Mystery' 
  | 'Cyberpunk' 
  | 'Slice of Life'
  | 'Adventure';

export interface Frame {
  id: string;
  dataUrl: string; // PNG representation of canvas drawing
  durationMs?: number;
}

export interface SoundEffectTrigger {
  frameIndex: number;
  soundType: 'swoosh' | 'laser' | 'explosion' | 'sparkle' | 'footstep' | 'chime' | 'hit' | 'glitch';
}

export interface Episode {
  id: string;
  showId: string;
  episodeNumber: number;
  title: string;
  synopsis: string;
  fps: number; // usually 4 to 24
  frames: Frame[];
  audioTrack?: 'synthwave' | 'chiptune' | 'ambient' | 'cinematic' | 'mysterious' | 'none';
  soundTriggers?: SoundEffectTrigger[];
  durationSeconds: number;
  createdAt: string;
}

export interface Review {
  id: string;
  showId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 - 5
  title: string;
  content: string;
  hasSpoilers: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  showId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestampSeconds?: number;
  frameIndex?: number;
  text: string;
  likes: number;
  createdAt: string;
}

export interface Show {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  genres: Genre[];
  maturityRating: 'TV-Y7' | 'TV-PG' | 'TV-14' | 'TV-MA';
  releaseYear: number;
  creatorName: string;
  thumbnailUrl: string;
  backdropUrl?: string;
  episodes: Episode[];
  featured?: boolean;
  matchScore?: number; // calculated per user
  viewsCount: number;
  reviews: Review[];
  comments: EpisodeComment[];
  createdAt: string;
}

export interface WatchHistoryItem {
  showId: string;
  episodeId: string;
  currentFrame: number;
  totalFrames: number;
  progressPercent: number;
  lastWatchedAt: string;
  completed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  preferredGenres: Genre[];
  watchlist: string[]; // show IDs
  likedShowIds: string[];
  watchHistory: Record<string, WatchHistoryItem>; // keyed by showId
  deviceId: string;
  deviceName: string;
  deviceType: 'tv' | 'mobile' | 'laptop';
  lastSyncedAt: string;
  syncToken: string;
}

export interface DeviceSession {
  id: string;
  name: string;
  type: 'tv' | 'mobile' | 'laptop';
  lastActive: string;
  currentShowTitle?: string;
  currentProgress?: number;
  isCurrentDevice?: boolean;
}

export type ActiveTab = 'home' | 'shows' | 'trending' | 'watchlist' | 'studio';
