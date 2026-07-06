import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Heart,
  Monitor,
} from "lucide-react";
import { usePlayerContext } from "../../hooks/usePlayerContext";

const Player: React.FC = () => {
  const {
    playerState,
    togglePlayPause,
    setVolume,
    setCurrentTime,
    toggleShuffle,
    toggleRepeat,
    nextTrack,
    previousTrack,
  } = usePlayerContext();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    playerState.duration > 0
      ? (playerState.currentTime / playerState.duration) * 100
      : 0;

  return (
    <footer className="h-24 bg-spotify-gray-900 border-t border-spotify-gray-600 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {playerState.currentTrack && (
          <>
            <img
              src={playerState.currentTrack.imageUrl}
              alt={playerState.currentTrack.title}
              className="w-14 h-14 rounded object-cover"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-medium truncate">
                {playerState.currentTrack.title}
              </span>
              <span className="text-spotify-gray-300 text-xs truncate">
                {playerState.currentTrack.artist}
              </span>
            </div>
            <button className="text-spotify-gray-300 hover:text-white transition-colors duration-200 p-2">
              <Heart size={16} />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 flex-1 max-w-lg">
        <div className="flex items-center gap-4">
          <button
            className={`text-spotify-gray-300 hover:text-white transition-colors duration-200 p-2 ${playerState.shuffle ? "text-spotify-green" : ""}`}
            onClick={toggleShuffle}
          >
            <Shuffle size={16} />
          </button>
          <button
            className="text-spotify-gray-300 hover:text-white transition-colors duration-200 p-2"
            onClick={previousTrack}
          >
            <SkipBack size={20} />
          </button>
          <button
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={togglePlayPause}
            disabled={!playerState.currentTrack}
          >
            {playerState.isPlaying ? (
              <Pause size={20} className="flex-shrink-0" />
            ) : (
              <Play size={20} className="flex-shrink-0 ml-0.5" />
            )}
          </button>
          <button
            className="text-spotify-gray-300 hover:text-white transition-colors duration-200 p-2"
            onClick={nextTrack}
          >
            <SkipForward size={20} />
          </button>
          <button
            className={`text-spotify-gray-300 hover:text-white transition-colors duration-200 p-2 ${playerState.repeat !== "none" ? "text-spotify-green" : ""}`}
            onClick={toggleRepeat}
          >
            <Repeat size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-spotify-gray-300 w-10 text-right">
            {formatTime(playerState.currentTime)}
          </span>
          <div className="flex-1 relative group">
            <div className="w-full h-1 bg-spotify-gray-600 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />
              <input
                type="range"
                min="0"
                max={playerState.duration}
                value={playerState.currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <span className="text-xs text-spotify-gray-300 w-10">
            {formatTime(playerState.duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 justify-end flex-1">
        <button className="text-spotify-gray-300 hover:text-white transition-colors duration-200 p-2">
          <Monitor size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-spotify-gray-300" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={playerState.volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 bg-spotify-gray-600 rounded-full appearance-none cursor-pointer slider:bg-white"
          />
        </div>
      </div>
    </footer>
  );
};

export default Player;
