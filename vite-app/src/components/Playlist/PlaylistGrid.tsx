import React from "react";
import { Play } from "lucide-react";
import type { Playlist, Track } from "../../types";

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistSelect: (playlist: Playlist) => void;
  onTrackPlay: (track: Track) => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  onPlaylistSelect,
  onTrackPlay,
}) => {
  const handlePlayClick = (e: React.MouseEvent, playlist: Playlist) => {
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      onTrackPlay(playlist.tracks[0]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="group cursor-pointer p-4 bg-spotify-gray-900/50 hover:bg-spotify-gray-700 rounded-lg transition-all duration-200"
          onClick={() => onPlaylistSelect(playlist)}
        >
          <div className="relative mb-4">
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className="w-full aspect-square object-cover rounded-lg shadow-lg"
            />
            <button
              className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg hover:scale-105"
              onClick={(e) => handlePlayClick(e, playlist)}
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
              {playlist.name}
            </h3>
            <p className="text-spotify-gray-300 text-sm line-clamp-2 leading-tight">
              {playlist.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaylistGrid;
