import React from "react";
import { Home, Search, Library, Plus, Heart, Mic2 } from "lucide-react";
import { mockPlaylists } from "../../data/mockData";
import type { Track } from "../../types";

interface SidebarProps {
  onTrackSelect: (track: Track) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onTrackSelect }) => {
  return (
    <aside className="w-72 bg-black px-6 py-6 flex flex-col gap-6 rounded-lg m-2 mr-0">
      <div className="flex items-center gap-3 mb-3">
        <Mic2 size={32} className="text-white" />
        <span className="text-2xl font-bold text-white">Spotify Clone</span>
      </div>

      <nav>
        <ul className="flex flex-col gap-4">
          <li className="flex items-center gap-4 px-3 py-2 rounded cursor-pointer transition-colors duration-200 text-white font-medium bg-spotify-gray-800">
            <Home size={24} />
            <span>Home</span>
          </li>
          <li className="flex items-center gap-4 px-3 py-2 rounded cursor-pointer transition-colors duration-200 text-spotify-gray-300 font-medium hover:bg-spotify-gray-800 hover:text-white">
            <Search size={24} />
            <span>Search</span>
          </li>
          <li className="flex items-center gap-4 px-3 py-2 rounded cursor-pointer transition-colors duration-200 text-spotify-gray-300 font-medium hover:bg-spotify-gray-800 hover:text-white">
            <Library size={24} />
            <span>Your Library</span>
          </li>
        </ul>
      </nav>

      <div className="pt-2 border-t border-spotify-gray-800">
        <div className="flex items-center gap-4 px-3 py-2 rounded cursor-pointer transition-colors duration-200 text-spotify-gray-300 font-medium mb-2 hover:bg-spotify-gray-800 hover:text-white">
          <Plus size={20} />
          <span>Create Playlist</span>
        </div>
        <div className="flex items-center gap-4 px-3 py-2 rounded cursor-pointer transition-colors duration-200 text-spotify-gray-300 font-medium hover:bg-spotify-gray-800 hover:text-white">
          <Heart size={20} />
          <span>Liked Songs</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="mb-4">
          <span className="text-spotify-gray-300 text-sm font-medium">
            Recently Created
          </span>
        </div>
        <ul className="space-y-2 overflow-y-auto max-h-64">
          {mockPlaylists.map((playlist) => (
            <li
              key={playlist.id}
              className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors duration-200 hover:bg-spotify-gray-800"
              onClick={() => {
                if (playlist.tracks.length > 0) {
                  onTrackSelect(playlist.tracks[0]);
                }
              }}
            >
              <img
                src={playlist.imageUrl}
                alt={playlist.name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-white text-sm font-medium truncate">
                  {playlist.name}
                </span>
                <span className="text-spotify-gray-300 text-xs truncate">
                  Playlist • {playlist.tracks.length} songs
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
