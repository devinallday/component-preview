import React, { useEffect, useState, useCallback } from "react";
import type { Track } from "../../types";
import { mockTracks } from "../../data/mockData";

interface AsyncTrackListProps {
  /**
   * Injectable fetcher. Defaults to a real-ish async that resolves the mock
   * tracks after a short delay. A generated mock can pass a fetcher that
   * resolves (success), rejects (error), or never resolves (loading) to force
   * the component into a specific state in isolation.
   */
  fetchTracks?: () => Promise<Track[]>;
}

const defaultFetchTracks = (): Promise<Track[]> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(mockTracks), 400);
  });

const AsyncTrackList: React.FC<AsyncTrackListProps> = ({
  fetchTracks = defaultFetchTracks,
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const load = useCallback(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage("");

    fetchTracks()
      .then((result) => {
        if (cancelled) return;
        setTracks(result);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          err instanceof Error ? err.message : "Unknown error occurred",
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [fetchTracks]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  if (status === "loading") {
    return (
      <div className="p-4 text-spotify-gray-300 text-sm" role="status">
        Loading tracks…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 text-red-400 text-sm" role="alert">
        <p className="font-medium">Failed to load tracks</p>
        <p className="text-red-300 text-xs mt-1">{errorMessage}</p>
        <button
          className="mt-3 px-3 py-1 rounded-full bg-white/10 text-white text-xs hover:bg-white/20 transition-colors duration-200"
          onClick={load}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-white text-lg font-bold mb-3">Tracks</h2>
      <ul className="flex flex-col gap-1">
        {tracks.map((track) => (
          <li
            key={track.id}
            className="flex flex-col px-3 py-2 rounded-md hover:bg-white/5 transition-colors duration-200"
          >
            <span className="text-white text-sm font-medium">
              {track.title}
            </span>
            <span className="text-spotify-gray-300 text-xs">
              {track.artist}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AsyncTrackList;
