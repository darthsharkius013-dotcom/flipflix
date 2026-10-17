import { Show, UserProfile, DeviceSession, WatchHistoryItem, Review, EpisodeComment } from '../types';
import { getDefaultShows } from '../data/defaultShows';

const SHOWS_STORAGE_KEY = 'flipflix_shows_catalog_v1';
const PROFILE_STORAGE_KEY = 'flipflix_user_profile_v1';
const SESSIONS_STORAGE_KEY = 'flipflix_active_sessions_v1';

// BroadcastChannel for cross-tab / cross-window live sync
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('flipflix_live_sync');
  } catch {
    // Fallback if BroadcastChannel unavailable
  }
}

export function generateSyncToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FLIX-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export function getDefaultProfile(): UserProfile {
  return {
    id: 'user-primary-1',
    name: 'Alex Rivera',
    avatar: '🍿',
    preferredGenres: ['Cyberpunk', 'Action', 'Anime', 'Sci-Fi'],
    watchlist: ['show-cyber-samurai', 'show-cosmic-cafe'],
    likedShowIds: ['show-cyber-samurai'],
    watchHistory: {
      'show-cyber-samurai': {
        showId: 'show-cyber-samurai',
        episodeId: 'cs-ep-1',
        currentFrame: 7,
        totalFrames: 12,
        progressPercent: 58,
        lastWatchedAt: new Date().toISOString(),
        completed: false,
      },
    },
    deviceId: 'dev-laptop-1',
    deviceName: 'MacBook Pro 16"',
    deviceType: 'laptop',
    lastSyncedAt: new Date().toISOString(),
    syncToken: generateSyncToken(),
  };
}

export function getDefaultDeviceSessions(): DeviceSession[] {
  return [
    {
      id: 'dev-laptop-1',
      name: 'MacBook Pro 16" (Current)',
      type: 'laptop',
      lastActive: 'Active now',
      currentShowTitle: 'Cyber Samurai: Neon Blade',
      currentProgress: 58,
      isCurrentDevice: true,
    },
    {
      id: 'dev-tv-livingroom',
      name: 'Living Room 4K OLED TV',
      type: 'tv',
      lastActive: '12 minutes ago',
      currentShowTitle: 'Cyber Samurai: Neon Blade',
      currentProgress: 58,
      isCurrentDevice: false,
    },
    {
      id: 'dev-mobile-phone',
      name: 'iPhone 16 Pro',
      type: 'mobile',
      lastActive: '1 hour ago',
      currentShowTitle: 'Cosmic Cafe',
      currentProgress: 30,
      isCurrentDevice: false,
    },
  ];
}

// Load Shows
export function loadShows(): Show[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SHOWS_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultShows();
      saveShows(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getDefaultShows();
      saveShows(initial);
      return initial;
    }
    return parsed;
  } catch {
    return getDefaultShows();
  }
}

// Save Shows
export function saveShows(shows: Show[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(shows));
    syncChannel?.postMessage({ type: 'SHOWS_UPDATED', payload: shows });
  } catch (err) {
    console.error('Failed to save shows to localStorage', err);
  }
}

// Load Profile
export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      const def = getDefaultProfile();
      saveProfile(def);
      return def;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultProfile();
  }
}

// Save Profile
export function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    profile.lastSyncedAt = new Date().toISOString();
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    syncChannel?.postMessage({ type: 'PROFILE_UPDATED', payload: profile });
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

// Load Devices
export function loadDeviceSessions(): DeviceSession[] {
  if (typeof window === 'undefined') return getDefaultDeviceSessions();
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultDeviceSessions();
      saveDeviceSessions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultDeviceSessions();
  }
}

// Save Devices
export function saveDeviceSessions(sessions: DeviceSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    syncChannel?.postMessage({ type: 'SESSIONS_UPDATED', payload: sessions });
  } catch (err) {
    console.error('Failed to save sessions', err);
  }
}

// Subscribe to cross-device/cross-window updates
export function subscribeToSync(
  onShowsChange: (shows: Show[]) => void,
  onProfileChange: (profile: UserProfile) => void,
  onSessionsChange: (sessions: DeviceSession[]) => void
) {
  if (!syncChannel) return () => {};

  const handler = (event: MessageEvent) => {
    const { type, payload } = event.data || {};
    if (type === 'SHOWS_UPDATED' && payload) {
      onShowsChange(payload);
    } else if (type === 'PROFILE_UPDATED' && payload) {
      onProfileChange(payload);
    } else if (type === 'SESSIONS_UPDATED' && payload) {
      onSessionsChange(payload);
    }
  };

  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel?.removeEventListener('message', handler);
  };
}

// Add review to a show
export function addReviewToShow(showId: string, review: Review): Show[] {
  const shows = loadShows();
  const updated = shows.map((s) => {
    if (s.id === showId) {
      return {
        ...s,
        reviews: [review, ...s.reviews],
      };
    }
    return s;
  });
  saveShows(updated);
  return updated;
}

// Add comment to an episode
export function addCommentToEpisode(comment: EpisodeComment): Show[] {
  const shows = loadShows();
  const updated = shows.map((s) => {
    if (s.id === comment.showId) {
      return {
        ...s,
        comments: [comment, ...s.comments],
      };
    }
    return s;
  });
  saveShows(updated);
  return updated;
}

// Export sync state as clean string payload
export function exportSyncPayload(): string {
  const profile = loadProfile();
  const shows = loadShows();
  const payload = {
    profile,
    showsCount: shows.length,
    syncToken: profile.syncToken,
    exportedAt: new Date().toISOString(),
  };
  return btoa(JSON.stringify(payload));
}

// Import sync state from code
export function importSyncPayload(encodedStr: string): boolean {
  try {
    const decoded = JSON.parse(atob(encodedStr.trim()));
    if (decoded && decoded.profile) {
      saveProfile(decoded.profile);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Invalid sync payload', e);
    return false;
  }
}
