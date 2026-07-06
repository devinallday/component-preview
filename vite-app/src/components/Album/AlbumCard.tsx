import React from "react";
import { Play } from "lucide-react";
import type { Album, Track } from "../../types";

interface AlbumCardProps {
  album: Album;
  onAlbumSelect: (album: Album) => void;
  onTrackPlay: (track: Track) => void;
  /** Color scheme to render in. Defaults to "dark" (the app's default surface). */
  theme?: "light" | "dark";
}

// Per-theme class sets. Keeping them in one place makes it easy to see the
// light/dark contrast and to add more themes later.
const THEME_STYLES = {
  dark: {
    container: "bg-spotify-gray-900/50 hover:bg-spotify-gray-700",
    title: "text-white",
    artist: "text-spotify-gray-300",
    year: "text-spotify-gray-400",
  },
  light: {
    container: "bg-gray-100 hover:bg-gray-200",
    title: "text-gray-900",
    artist: "text-gray-600",
    year: "text-gray-500",
  },
} as const;

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onAlbumSelect,
  onTrackPlay,
  theme = "dark",
}) => {
  const styles = THEME_STYLES[theme];

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (album.tracks.length > 0) {
      onTrackPlay(album.tracks[0]);
    }
  };

  return (
    <div
      className={`group cursor-pointer p-8 ${styles.container} rounded-lg transition-all duration-200`}
      onClick={() => onAlbumSelect(album)}
    >
      <div className="relative mb-4">
        <img
          src={album.imageUrl}
          alt={album.title}
          className="w-full aspect-square object-cover rounded-lg shadow-lg"
        />
        <button
          className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg hover:scale-105"
          onClick={handlePlayClick}
        >
          <Play
            size={24}
            fill="currentColor"
            className="text-black flex-shrink-0 ml-0.5"
          />
        </button>
      </div>
      <div className="space-y-1">
        <h3
          className={`${styles.title} font-medium text-sm line-clamp-2 leading-tight`}
        >
          {album.title}
        </h3>
        <p className={`${styles.artist} text-sm truncate`}>{album.artist}</p>
        <p className={`${styles.year} text-xs`}>{album.year}</p>
      </div>
    </div>
  );
};

export default AlbumCard;
