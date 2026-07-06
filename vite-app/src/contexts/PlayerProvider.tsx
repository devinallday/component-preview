import React, { useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Track, PlayerState, Playlist, PlayerContextType } from "../types";
import { mockPlaylists } from "../data/mockData";
import { PlayerContext } from "./PlayerContext";

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    queue: [],
    shuffle: false,
    repeat: "none",
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);

  const playTrack = useCallback((track: Track) => {
    setPlayerState((prev) => {
      // If the same track is already playing, toggle play/pause
      if (prev.currentTrack?.id === track.id) {
        return {
          ...prev,
          isPlaying: !prev.isPlaying,
        };
      }

      // Otherwise, play the new track
      return {
        ...prev,
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
        duration: track.duration,
      };
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setPlayerState((prev) => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setPlayerState((prev) => ({
      ...prev,
      currentTime: Math.max(0, Math.min(prev.duration, time)),
    }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      shuffle: !prev.shuffle,
    }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      repeat:
        prev.repeat === "none"
          ? "playlist"
          : prev.repeat === "playlist"
            ? "track"
            : "none",
    }));
  }, []);

  const addToQueue = useCallback((tracks: Track[]) => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [...prev.queue, ...tracks],
    }));
  }, []);

  const nextTrack = useCallback(() => {
    setPlayerState((prev) => {
      if (prev.queue.length > 0) {
        const [nextTrack, ...remainingQueue] = prev.queue;
        return {
          ...prev,
          currentTrack: nextTrack,
          queue: remainingQueue,
          currentTime: 0,
          duration: nextTrack.duration,
        };
      }
      return prev;
    });
  }, []);

  const previousTrack = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      currentTime: 0,
    }));
  }, []);

  const addToPlaylist = useCallback(
    (trackId: string, playlistId: string) => {
      setPlaylists((prev) =>
        prev.map((playlist) => {
          if (playlist.id === playlistId) {
            // Check if track is already in playlist
            const trackExists = playlist.tracks.some(
              (track) => track.id === trackId,
            );
            if (!trackExists) {
              // Find the track from mock data or current playing track
              const trackToAdd =
                playerState.currentTrack?.id === trackId
                  ? playerState.currentTrack
                  : playlists
                      .find((p) => p.tracks.some((t) => t.id === trackId))
                      ?.tracks.find((t) => t.id === trackId);

              if (trackToAdd) {
                return {
                  ...playlist,
                  tracks: [...playlist.tracks, trackToAdd],
                };
              }
            }
          }
          return playlist;
        }),
      );
    },
    [playerState.currentTrack, playlists],
  );

  const removeFromPlaylist = useCallback(
    (trackId: string, playlistId: string) => {
      setPlaylists((prev) =>
        prev.map((playlist) => {
          if (playlist.id === playlistId) {
            return {
              ...playlist,
              tracks: playlist.tracks.filter((track) => track.id !== trackId),
            };
          }
          return playlist;
        }),
      );
    },
    [],
  );

  const createPlaylist = useCallback(
    (name: string, description: string = "") => {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name,
        description,
        imageUrl:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        tracks: [],
        owner: "Music Lover",
        isPublic: false,
      };

      setPlaylists((prev) => [...prev, newPlaylist]);
      return newPlaylist;
    },
    [],
  );

  const value: PlayerContextType = {
    playerState,
    playTrack,
    togglePlayPause,
    setVolume,
    setCurrentTime,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    nextTrack,
    previousTrack,
    addToPlaylist,
    removeFromPlaylist,
    createPlaylist,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
