import AlbumCard from "./AlbumCard";
import type { Album } from "../../types";

const album: Album = {
  id: "1",
  title: "Random Access Memories",
  artist: "Daft Punk",
  year: 2013,
  imageUrl: "https://picsum.photos/seed/album/300/300",
  tracks: [],
};

export default function Mock() {
  return (
    <div style={{ padding: 24, maxWidth: 240 }}>
      <AlbumCard
        album={album}
        onAlbumSelect={() => {}}
        onTrackPlay={() => {}}
      />
    </div>
  );
}
