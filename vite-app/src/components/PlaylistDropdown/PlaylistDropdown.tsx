import React, { useCallback, useState } from "react";
import Dropdown from "../Dropdown/Dropdown";
import { usePlayerContext } from "../../hooks/usePlayerContext";
import type { DropdownItem, Track, PlaylistAction } from "../../types";

interface PlaylistDropdownProps {
  track: Track;
  trigger?: React.ReactNode;
}

const PlaylistDropdown: React.FC<PlaylistDropdownProps> = ({
  track,
  trigger,
}) => {
  const { addToPlaylist, createPlaylist } = usePlayerContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleAddToPlaylist = useCallback(
    (playlistId: string) => {
      addToPlaylist(track.id, playlistId);
    },
    [addToPlaylist, track.id],
  );

  const handleCreatePlaylist = useCallback(() => {
    if (newPlaylistName.trim()) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      addToPlaylist(track.id, newPlaylist.id);
      setNewPlaylistName("");
      setShowCreateForm(false);
    }
  }, [newPlaylistName, createPlaylist, addToPlaylist, track.id]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCreatePlaylist();
      } else if (e.key === "Escape") {
        setShowCreateForm(false);
        setNewPlaylistName("");
      }
    },
    [handleCreatePlaylist],
  );

  const handlePlaylistSelect = useCallback(
    (action: PlaylistAction) => {
      if (action === "create-new") {
        setShowCreateForm(true);
      } else if (
        typeof action === "object" &&
        action.type === "add-to-playlist"
      ) {
        handleAddToPlaylist(action.playlistId);
      }
    },
    [handleAddToPlaylist],
  );

  // Mock playlists for demonstration
  const mockPlaylists = [
    { id: "1", name: "My Favorites", tracks: [] },
    { id: "2", name: "Workout Mix", tracks: [] },
    { id: "3", name: "Chill Vibes", tracks: [] },
  ];

  const menuItems: DropdownItem<PlaylistAction>[] = [
    {
      id: "create-new",
      label: "Create new playlist",
      icon: "➕",
      value: "create-new",
    },
    {
      id: "separator",
      label: "",
      value: "create-new", // dummy value for separator
      separator: true,
    },
    ...mockPlaylists.map((playlist) => ({
      id: playlist.id,
      label: playlist.name,
      icon: "🎵",
      value: { type: "add-to-playlist" as const, playlistId: playlist.id },
    })),
  ];

  const defaultTrigger = (
    <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors duration-200 text-spotify-gray-300 hover:text-white">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0 3a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0 3a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0 3a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11z" />
      </svg>
    </button>
  );

  if (showCreateForm) {
    return (
      <div className="bg-spotify-gray-700 border border-spotify-gray-600 rounded-lg p-4 min-w-64">
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter playlist name"
          className="w-full bg-spotify-gray-800 border border-spotify-gray-600 rounded px-3 py-2 text-white text-sm placeholder-spotify-gray-300 focus:outline-none focus:border-spotify-green"
          autoFocus
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleCreatePlaylist}
            disabled={!newPlaylistName.trim()}
            className="flex-1 bg-spotify-green text-black font-medium px-3 py-1.5 rounded text-sm hover:bg-spotify-green/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
          <button
            onClick={() => {
              setShowCreateForm(false);
              setNewPlaylistName("");
            }}
            className="flex-1 bg-transparent border border-spotify-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-white/10 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Dropdown
      trigger={trigger || defaultTrigger}
      items={menuItems}
      onSelect={handlePlaylistSelect}
      align="left"
      className=""
    />
  );
};

export default PlaylistDropdown;
