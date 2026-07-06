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

const THEMES = ["dark", "light"] as const;

// Backdrop per theme so the card's own light/dark surface reads correctly.
const BACKDROP: Record<(typeof THEMES)[number], string> = {
  dark: "#121212",
  light: "#ffffff",
};

export default function Mock() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 24,
        padding: 24,
      }}
    >
      {THEMES.map((theme) => (
        <div key={theme}>
          <div
            style={{
              fontSize: 12,
              marginBottom: 8,
              opacity: 0.6,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            theme="{theme}"
          </div>
          <div
            style={{
              background: BACKDROP[theme],
              borderRadius: 12,
              padding: 16,
              maxWidth: 240,
            }}
          >
            <AlbumCard
              album={album}
              theme={theme}
              onAlbumSelect={() => {}}
              onTrackPlay={() => {}}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
