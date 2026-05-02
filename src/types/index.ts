export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  thumbnailHigh?: string;
  duration: string;
  channelId: string;
  channelTitle: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  coverImage: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  isPublic: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: number;
  lastLogin: number;
}

export interface SearchResult {
  tracks: Track[];
  nextPageToken?: string;
  totalResults: number;
}

export interface HistoryEntry {
  track: Track;
  playedAt: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
}
