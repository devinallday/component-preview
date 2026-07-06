import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePlayerContext } from "../../hooks/usePlayerContext";
import type { ContextMenuItem, Track } from "../../types";

interface ContextMenuProps {
  track: Track;
  children: React.ReactNode;
  onAddToQueue?: (track: Track) => void;
  onViewAlbum?: (track: Track) => void;
  onViewArtist?: (track: Track) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  track,
  children,
  onAddToQueue,
  onViewAlbum,
  onViewArtist,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToQueue, playTrack } = usePlayerContext();

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
      setIsVisible(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleItemClick = useCallback(
    (item: ContextMenuItem) => {
      item.onClick();
      handleClose();
    },
    [handleClose],
  );

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleClose]);

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (isVisible && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position
      if (position.x + rect.width > viewportWidth) {
        newX = position.x - rect.width;
      }

      // Adjust vertical position
      if (position.y + rect.height > viewportHeight) {
        newY = position.y - rect.height;
      }

      // Ensure menu doesn't go off-screen
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isVisible, position]);

  const menuItems: ContextMenuItem[] = [
    {
      id: "play",
      label: "Play now",
      icon: "▶️",
      onClick: () => playTrack(track),
    },
    {
      id: "add-to-queue",
      label: "Add to queue",
      icon: "📋",
      onClick: () => {
        addToQueue([track]);
        onAddToQueue?.(track);
      },
    },
    {
      id: "add-to-playlist",
      label: "Add to playlist",
      icon: "➕",
      onClick: () => {
        // This would typically open a playlist selection modal
        console.log("Add to playlist:", track.title);
      },
    },
    {
      id: "separator1",
      label: "",
      onClick: () => {},
    },
    {
      id: "view-album",
      label: "Go to album",
      icon: "💿",
      onClick: () => {
        onViewAlbum?.(track);
        console.log("Navigate to album:", track.album);
      },
    },
    {
      id: "view-artist",
      label: "Go to artist",
      icon: "🎤",
      onClick: () => {
        onViewArtist?.(track);
        console.log("Navigate to artist:", track.artist);
      },
    },
    {
      id: "separator2",
      label: "",
      onClick: () => {},
    },
    {
      id: "share",
      label: "Share",
      icon: "🔗",
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: track.title,
            text: `Check out "${track.title}" by ${track.artist}`,
            url: window.location.href,
          });
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard?.writeText(`${track.title} by ${track.artist}`);
        }
      },
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative"
      onContextMenu={handleContextMenu}
    >
      {children}

      {isVisible && (
        <div
          ref={menuRef}
          className="fixed bg-spotify-gray-700 border border-spotify-gray-600 rounded-lg shadow-2xl min-w-48 py-1 z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: position.x,
            top: position.y,
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {menuItems.map((item) => {
            if (!item.label) {
              return (
                <div
                  key={item.id}
                  className="h-px bg-spotify-gray-600 my-1 mx-2"
                />
              );
            }

            return (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                role="menuitem"
              >
                {item.icon && (
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-spotify-gray-300">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
