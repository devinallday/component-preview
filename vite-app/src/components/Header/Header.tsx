import React, { useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import UserMenu from "../UserMenu/UserMenu";
import Tooltip from "../Tooltip/Tooltip";
import type { SearchResult } from "../../types";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  canNavigateBack?: boolean;
  canNavigateForward?: boolean;
  searchResults?: SearchResult;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNavigateBack,
  onNavigateForward,
  canNavigateBack = false,
  canNavigateForward = false,
  searchResults,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(searchQuery);
    },
    [onSearch, searchQuery],
  );

  const handleNotifications = useCallback(() => {
    console.log("Open notifications");
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-black/10 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50 gap-6 w-screen ml-0 mr-0 box-border">
      <div className="flex gap-2 items-center">
        <Tooltip content="Go back" position="bottom">
          <button
            className={`w-10 h-10 rounded-full border-none bg-black/70 text-white cursor-pointer flex items-center justify-center transition-all duration-200 ${!canNavigateBack ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
            onClick={onNavigateBack}
            disabled={!canNavigateBack}
          >
            <ChevronLeft size={20} />
          </button>
        </Tooltip>

        <Tooltip content="Go forward" position="bottom">
          <button
            className={`w-10 h-10 rounded-full border-none bg-black/70 text-white cursor-pointer flex items-center justify-center transition-all duration-200 ${!canNavigateForward ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
            onClick={onNavigateForward}
            disabled={!canNavigateForward}
          >
            <ChevronRight size={20} />
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 max-w-md relative">
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div
            className={`relative flex items-center bg-spotify-gray-700 border border-spotify-gray-600 rounded-3xl px-4 transition-all duration-200 ${isFocused ? "border-spotify-green bg-spotify-gray-800" : ""}`}
          >
            <Search
              size={16}
              className="text-spotify-gray-300 mr-3 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 bg-transparent border-none text-white text-sm py-3 outline-none placeholder-spotify-gray-300"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  onSearch?.("");
                }}
                className="bg-transparent border-none text-spotify-gray-300 cursor-pointer p-1 ml-2 rounded-full flex items-center justify-center transition-all duration-200 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Search Results Preview */}
        {searchQuery && searchResults && (
          <div className="absolute top-full left-0 right-0 bg-spotify-gray-700 border border-spotify-gray-600 rounded-lg shadow-2xl mt-2 p-4 z-50 animate-in slide-in-from-top-2 duration-200">
            {searchResults.tracks.length > 0 && (
              <div className="mb-4 last:mb-0">
                <h4 className="text-white text-base font-bold mb-3">Songs</h4>
                {searchResults.tracks.slice(0, 3).map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors duration-200 hover:bg-white/10"
                  >
                    <img
                      src={track.imageUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-white text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {track.title}
                      </span>
                      <span className="text-spotify-gray-300 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {track.artist}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.albums.length > 0 && (
              <div className="mb-4 last:mb-0">
                <h4 className="text-white text-base font-bold mb-3">Albums</h4>
                {searchResults.albums.slice(0, 2).map((album) => (
                  <div
                    key={album.id}
                    className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors duration-200 hover:bg-white/10"
                  >
                    <img
                      src={album.imageUrl}
                      alt={album.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-white text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {album.title}
                      </span>
                      <span className="text-spotify-gray-300 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {album.artist}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Tooltip content="What's New" position="bottom">
          <button
            className="w-10 h-10 rounded-full border-none bg-white/10 text-spotify-gray-300 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/20 hover:text-white"
            onClick={handleNotifications}
          >
            <Bell size={20} />
          </button>
        </Tooltip>

        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
