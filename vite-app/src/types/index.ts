export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  imageUrl: string;
  audioUrl?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tracks: Track[];
  owner: string;
  isPublic: boolean;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  shuffle: boolean;
  repeat: "none" | "track" | "playlist";
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  playlists: Playlist[];
}

// New types for enhanced components
export interface DropdownItem<T = any> {
  id: string;
  label: string;
  icon?: string;
  value: T;
  disabled?: boolean;
  separator?: boolean;
}

export interface DropdownProps<T = any> {
  items: DropdownItem<T>[];
  onSelect: (value: T, item: DropdownItem<T>) => void;
  align?: "left" | "right" | "center";
  className?: string;
  onClose?: () => void;
}

// Value types for specific dropdown usage
export type UserMenuAction = "profile" | "settings" | "upgrade" | "logout";
export type PlaylistAction =
  | "create-new"
  | { type: "add-to-playlist"; playlistId: string };

export interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  children: React.ReactNode;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
}

export interface PlayerContextType {
  playerState: PlayerState;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (tracks: Track[]) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToPlaylist: (trackId: string, playlistId: string) => void;
  removeFromPlaylist: (trackId: string, playlistId: string) => void;
  createPlaylist: (name: string, description?: string) => Playlist;
}

export interface SearchResult {
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
  artists: string[];
}
