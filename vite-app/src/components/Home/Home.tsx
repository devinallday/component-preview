import React from "react";
import { Play } from "lucide-react";
import PlaylistGrid from "../Playlist/PlaylistGrid";
import TrackItem from "../Track/TrackItem";
import AlbumCard from "../Album/AlbumCard";
import { mockPlaylists, mockTracks, mockAlbums } from "../../data/mockData";
import type { Track, Playlist, Album } from "../../types";

interface HomeProps {
  onTrackPlay: (track: Track) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
}

const Home: React.FC<HomeProps> = ({
  onTrackPlay,
  currentTrack,
  isPlaying,
}) => {
  const handlePlaylistSelect = (playlist: Playlist) => {
    console.log("Selected playlist:", playlist.name);
    // In a real app, this would navigate to the playlist view
  };

  const handleAlbumSelect = (album: Album) => {
    console.log("Selected album:", album.title);
    // In a real app, this would navigate to the album view
  };

  const recentTracks = mockTracks.slice(0, 6);

  return (
    <div className="p-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">Good evening</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Recently played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recentTracks.map((track) => (
            <div
              key={track.id}
              className="relative group bg-spotify-gray-700 rounded-md p-4 cursor-pointer hover:bg-spotify-gray-600 transition-colors duration-200"
            >
              <img
                src={track.imageUrl}
                alt={track.title}
                className="w-full aspect-square object-cover rounded-md mb-3"
              />
              <span className="text-white font-medium text-sm truncate block">
                {track.title}
              </span>
              <button
                className="absolute bottom-4 right-4 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg hover:scale-105"
                onClick={() => onTrackPlay(track)}
              >
                <Play
                  size={16}
                  fill="currentColor"
                  className="text-black ml-0.5 flex-shrink-0"
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Made for you</h2>
          <button className="text-spotify-gray-300 hover:text-white text-sm font-medium transition-colors duration-200">
            Show all
          </button>
        </div>
        <PlaylistGrid
          playlists={mockPlaylists}
          onPlaylistSelect={handlePlaylistSelect}
          onTrackPlay={onTrackPlay}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Popular albums</h2>
          <button className="text-spotify-gray-300 hover:text-white text-sm font-medium transition-colors duration-200">
            Show all
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mockAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onAlbumSelect={handleAlbumSelect}
              onTrackPlay={onTrackPlay}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Popular tracks</h2>
          <button className="text-spotify-gray-300 hover:text-white text-sm font-medium transition-colors duration-200">
            Show all
          </button>
        </div>
        <div className="space-y-2">
          {mockTracks.slice(0, 5).map((track, index) => (
            <TrackItem
              key={track.id}
              track={track}
              index={index}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              onPlay={onTrackPlay}
              showAlbumArt={true}
              showAlbumName={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
