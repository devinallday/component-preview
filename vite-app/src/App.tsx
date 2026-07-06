import React, { useState, useCallback } from "react";
import { PlayerProvider } from "./contexts/PlayerProvider";
import Layout from "./components/Layout/Layout";
import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import { usePlayerContext } from "./hooks/usePlayerContext";
import type { Track, SearchResult } from "./types";
import { mockTracks, mockAlbums } from "./data/mockData";

// Main App Content Component (needs to be inside PlayerProvider)
const AppContent: React.FC = () => {
  const playerContext = usePlayerContext();
  const [searchResults, setSearchResults] = useState<
    SearchResult | undefined
  >();
  const [navigationHistory] = useState<string[]>(["home"]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const handleTrackSelect = useCallback(
    (track: Track) => {
      playerContext.playTrack(track);
    },
    [playerContext],
  );

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults(undefined);
      return;
    }

    // Simple search implementation
    const filteredTracks = mockTracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()) ||
        track.album.toLowerCase().includes(query.toLowerCase()),
    );

    const filteredAlbums = mockAlbums.filter(
      (album) =>
        album.title.toLowerCase().includes(query.toLowerCase()) ||
        album.artist.toLowerCase().includes(query.toLowerCase()),
    );

    const artists = Array.from(
      new Set([
        ...filteredTracks.map((track) => track.artist),
        ...filteredAlbums.map((album) => album.artist),
      ]),
    ).filter((artist) => artist.toLowerCase().includes(query.toLowerCase()));

    setSearchResults({
      tracks: filteredTracks,
      albums: filteredAlbums,
      playlists: [], // Could be implemented later
      artists,
    });
  }, []);

  const handleNavigateBack = useCallback(() => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex((prev) => prev - 1);
    }
  }, [currentHistoryIndex]);

  const handleNavigateForward = useCallback(() => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      setCurrentHistoryIndex((prev) => prev + 1);
    }
  }, [currentHistoryIndex, navigationHistory.length]);

  return (
    <div className="h-screen flex flex-col bg-black">
      <Header
        onSearch={handleSearch}
        onNavigateBack={handleNavigateBack}
        onNavigateForward={handleNavigateForward}
        canNavigateBack={currentHistoryIndex > 0}
        canNavigateForward={currentHistoryIndex < navigationHistory.length - 1}
        searchResults={searchResults}
      />
      <Layout onTrackSelect={handleTrackSelect}>
        <Home
          onTrackPlay={handleTrackSelect}
          currentTrack={playerContext.playerState.currentTrack}
          isPlaying={playerContext.playerState.isPlaying}
        />
      </Layout>
    </div>
  );
};

function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}

export default App;
