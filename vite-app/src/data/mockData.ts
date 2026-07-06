import type { Track, Album, Playlist, User } from "../types";

export const mockTracks: Track[] = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: 355,
    imageUrl: "https://picsum.photos/seed/queen/300/300",
  },
  {
    id: "2",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    duration: 391,
    imageUrl: "https://picsum.photos/seed/eagles/300/300",
  },
  {
    id: "3",
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    duration: 482,
    imageUrl: "https://picsum.photos/seed/zeppelin/300/300",
  },
  {
    id: "4",
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    duration: 183,
    imageUrl: "https://picsum.photos/seed/lennon/300/300",
  },
  {
    id: "5",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    duration: 356,
    imageUrl: "https://picsum.photos/seed/guns/300/300",
  },
  {
    id: "6",
    title: "Purple Haze",
    artist: "Jimi Hendrix",
    album: "Are You Experienced",
    duration: 170,
    imageUrl: "https://picsum.photos/seed/hendrix/300/300",
  },
  {
    id: "7",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    duration: 294,
    imageUrl: "https://picsum.photos/seed/thriller/300/300",
  },
  {
    id: "8",
    title: "Like a Rolling Stone",
    artist: "Bob Dylan",
    album: "Highway 61 Revisited",
    duration: 369,
    imageUrl: "https://picsum.photos/seed/dylan/300/300",
  },
];

export const mockAlbums: Album[] = [
  {
    id: "1",
    title: "A Night at the Opera",
    artist: "Queen",
    year: 1975,
    imageUrl: "https://picsum.photos/seed/queen/300/300",
    tracks: [mockTracks[0]],
  },
  {
    id: "2",
    title: "Hotel California",
    artist: "Eagles",
    year: 1976,
    imageUrl: "https://picsum.photos/seed/eagles/300/300",
    tracks: [mockTracks[1]],
  },
  {
    id: "3",
    title: "Thriller",
    artist: "Michael Jackson",
    year: 1982,
    imageUrl: "https://picsum.photos/seed/thriller/300/300",
    tracks: [mockTracks[6]],
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: "1",
    name: "Classic Rock Hits",
    description: "The best of classic rock music",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    tracks: [mockTracks[0], mockTracks[1], mockTracks[2], mockTracks[4]],
    owner: "Music Lover",
    isPublic: true,
  },
  {
    id: "2",
    name: "Chill Vibes",
    description: "Relaxing songs for any mood",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
    tracks: [mockTracks[3], mockTracks[7]],
    owner: "Music Lover",
    isPublic: true,
  },
  {
    id: "3",
    name: "My Favorites",
    description: "Personal collection of favorite tracks",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    tracks: [mockTracks[0], mockTracks[3], mockTracks[6]],
    owner: "Music Lover",
    isPublic: false,
  },
];

export const mockUser: User = {
  id: "1",
  name: "Music Lover",
  email: "musiclover@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  playlists: mockPlaylists,
};
