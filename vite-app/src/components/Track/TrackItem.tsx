import React, { useState, useCallback } from "react";
import { Play, Pause, Heart, MoreHorizontal, Plus } from "lucide-react";
import Tooltip from "../Tooltip/Tooltip";
import ContextMenu from "../ContextMenu/ContextMenu";
import PlaylistDropdown from "../PlaylistDropdown/PlaylistDropdown";
import type { Track } from "../../types";

interface TrackItemProps {
  track: Track;
  index?: number;
  isPlaying?: boolean;
  onPlay: (track: Track) => void;
  showAlbumArt?: boolean;
  showAlbumName?: boolean;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  isPlaying = false,
  onPlay,
  showAlbumArt = false,
  showAlbumName = true,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLikeToggle = useCallback(() => {
    setIsLiked(!isLiked);
  }, [isLiked]);

  const handleAddToQueue = useCallback((track: Track) => {
    console.log("Added to queue:", track.title);
  }, []);

  const handleViewAlbum = useCallback((track: Track) => {
    console.log("Navigate to album:", track.album);
  }, []);

  const handleViewArtist = useCallback((track: Track) => {
    console.log("Navigate to artist:", track.artist);
  }, []);

  return (
    <ContextMenu
      track={track}
      onAddToQueue={handleAddToQueue}
      onViewAlbum={handleViewAlbum}
      onViewArtist={handleViewArtist}
    >
      <div className="grid grid-cols-[40px_auto_1fr_auto] gap-4 items-center px-4 py-2 rounded-md hover:bg-white/5 transition-colors duration-200 group">
        <div className="flex items-center justify-center">
          <Tooltip content={isPlaying ? "Pause" : "Play"} position="top">
            <button
              className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-white hover:scale-105 transition-all duration-200"
              onClick={() => onPlay(track)}
            >
              {isPlaying ? (
                <Pause size={16} className="flex-shrink-0" />
              ) : index !== undefined ? (
                <>
                  <span className="group-hover:hidden text-spotify-gray-300 text-sm">
                    {index + 1}
                  </span>
                  <Play
                    size={16}
                    className="hidden group-hover:block flex-shrink-0"
                  />
                </>
              ) : (
                <Play size={16} className="flex-shrink-0" />
              )}
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          {showAlbumArt && (
            <img
              src={track.imageUrl}
              alt={track.title}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div className="flex flex-col">
            <Tooltip content={track.title} position="top">
              <div className="text-white text-sm font-medium truncate">
                {track.title}
              </div>
            </Tooltip>
            <Tooltip content={`Go to ${track.artist}`} position="bottom">
              <div className="text-spotify-gray-300 text-xs truncate hover:text-white cursor-pointer">
                {track.artist}
              </div>
            </Tooltip>
          </div>
        </div>

        {showAlbumName && (
          <div className="hidden md:block">
            <Tooltip content={`Go to album: ${track.album}`} position="top">
              <span className="text-spotify-gray-300 text-sm truncate hover:text-white cursor-pointer">
                {track.album}
              </span>
            </Tooltip>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Tooltip
            content={isLiked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            position="top"
          >
            <button
              className={`opacity-0 group-hover:opacity-100 text-spotify-gray-300 hover:text-white transition-all duration-200 p-1 ${isLiked ? "text-spotify-green opacity-100" : ""}`}
              onClick={handleLikeToggle}
            >
              <Heart size={16} fill={isLiked ? "#1db954" : "none"} />
            </button>
          </Tooltip>

          <span className="text-spotify-gray-300 text-sm min-w-[3rem] text-right">
            {formatDuration(track.duration)}
          </span>

          <Tooltip content="Add to playlist" position="top">
            <div className="opacity-0 group-hover:opacity-100">
              <PlaylistDropdown
                track={track}
                trigger={
                  <button className="text-spotify-gray-300 hover:text-white transition-colors duration-200 p-1">
                    <Plus size={16} />
                  </button>
                }
              />
            </div>
          </Tooltip>

          <Tooltip content="More options" position="top">
            <button className="opacity-0 group-hover:opacity-100 text-spotify-gray-300 hover:text-white transition-all duration-200 p-1">
              <MoreHorizontal size={16} />
            </button>
          </Tooltip>
        </div>
      </div>
    </ContextMenu>
  );
};

export default TrackItem;
