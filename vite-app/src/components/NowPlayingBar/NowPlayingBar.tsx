import React from "react";
import { Music, Sun, Moon } from "lucide-react";
import { usePlayerContext } from "../../hooks/usePlayerContext";
import { useThemeContext } from "../../hooks/useThemeContext";

/**
 * NowPlayingBar — AXIS: multiple / nested contexts.
 * Depends on BOTH the PlayerContext (via usePlayerContext) and the Theme
 * context (via useThemeContext). To render without throwing it must be wrapped
 * in BOTH <PlayerProvider> and <ThemeProvider>.
 */
const NowPlayingBar: React.FC = () => {
  const { playerState, togglePlayPause } = usePlayerContext();
  const { theme, toggleTheme } = useThemeContext();

  const { currentTrack, isPlaying } = playerState;

  const containerClasses =
    theme === "dark"
      ? "bg-spotify-gray-900 text-white border-white/10"
      : "bg-white text-black border-black/10";

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 border-t ${containerClasses}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.imageUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {currentTrack.title}
              </span>
              <span className="text-xs opacity-70 truncate">
                {currentTrack.artist}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 opacity-70">
            <Music size={18} />
            <span className="text-sm">Nothing playing</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="text-sm px-3 py-1 rounded-full bg-current/10 hover:opacity-80 transition-opacity duration-200"
          onClick={togglePlayPause}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="p-1 opacity-70 hover:opacity-100 transition-opacity duration-200"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span className="sr-only">
            {theme === "dark" ? "Switch to light" : "Switch to dark"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default NowPlayingBar;
