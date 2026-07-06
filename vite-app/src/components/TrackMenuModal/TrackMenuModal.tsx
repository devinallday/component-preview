import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ListPlus, ListMusic, User, X } from "lucide-react";
import type { Track } from "../../types";

interface TrackMenuModalProps {
  track: Track;
  open?: boolean;
  onClose: () => void;
  onAddToQueue?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onViewArtist?: (track: Track) => void;
}

const TrackMenuModal: React.FC<TrackMenuModalProps> = ({
  track,
  open = false,
  onClose,
  onAddToQueue,
  onAddToPlaylist,
  onViewArtist,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  // Rendered via a portal into document.body — OUTSIDE this component's own
  // subtree (and outside #root).
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Actions for ${track.title}`}
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        data-testid="track-menu-backdrop"
      />
      <div className="relative z-10 w-80 max-w-[90vw] bg-spotify-gray-900 rounded-lg shadow-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={track.imageUrl}
              alt={track.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex flex-col">
              <span className="text-white text-sm font-medium">
                {track.title}
              </span>
              <span className="text-spotify-gray-300 text-xs">
                {track.artist}
              </span>
            </div>
          </div>
          <button
            className="text-spotify-gray-300 hover:text-white transition-colors duration-200 p-1"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="flex flex-col">
          <li>
            <button
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-white text-sm hover:bg-white/5 transition-colors duration-200"
              onClick={() => onAddToQueue?.(track)}
            >
              <ListPlus size={16} />
              Add to queue
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-white text-sm hover:bg-white/5 transition-colors duration-200"
              onClick={() => onAddToPlaylist?.(track)}
            >
              <ListMusic size={16} />
              Add to playlist
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-white text-sm hover:bg-white/5 transition-colors duration-200"
              onClick={() => onViewArtist?.(track)}
            >
              <User size={16} />
              View artist
            </button>
          </li>
        </ul>
      </div>
    </div>,
    document.body,
  );
};

export default TrackMenuModal;
