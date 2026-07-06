import React from "react";
import { Play } from "lucide-react";
import type { Album, Track } from "../../types";

interface AlbumCardProps {
  album: Album;
  onAlbumSelect: (album: Album) => void;
  onTrackPlay: (track: Track) => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onAlbumSelect,
  onTrackPlay,
}) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (album.tracks.length > 0) {
      onTrackPlay(album.tracks[0]);
    }
  };

  return (
    <div
      className="group cursor-pointer p-8 bg-spotify-gray-900/50 hover:bg-spotify-gray-700 rounded-lg transition-all duration-200"
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
        <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight">
          {album.title}
        </h3>
        <p className="text-spotify-gray-300 text-sm truncate">{album.artist}</p>
        <p className="text-spotify-gray-400 text-xs">{album.year}</p>
        <p className="text-spotify-gray-500 text-xs">{album.tracks.length} tracks</p>
      </div>
    </div>
  );
};

export default AlbumCard;
