import { useState, useCallback } from "react";
import type { Track, PlayerState } from "../types";

export const usePlayer = () => {
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

  const playTrack = useCallback((track: Track) => {
    setPlayerState((prev) => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration,
    }));
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
    // In a real implementation, you might maintain a history
    setPlayerState((prev) => ({
      ...prev,
      currentTime: 0,
    }));
  }, []);

  return {
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
  };
};
