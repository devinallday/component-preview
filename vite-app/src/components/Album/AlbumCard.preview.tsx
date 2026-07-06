import AlbumCard from "./AlbumCard";
import type { Album } from "../../types";

// Preview with 6 albums × 2 themes to demonstrate scrolling and the new toolbar.
const albums: Album[] = [
  {
    id: "1",
    title: "Random Access Memories",
    artist: "Daft Punk",
    year: 2013,
    imageUrl: "https://picsum.photos/seed/ram/300/300",
    tracks: [],
  },
  {
    id: "2",
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    year: 1973,
    imageUrl: "https://picsum.photos/seed/dsotm/300/300",
    tracks: [],
  },
  {
    id: "3",
    title: "Abbey Road",
    artist: "The Beatles",
    year: 1969,
    imageUrl: "https://picsum.photos/seed/abbey/300/300",
    tracks: [],
  },
  {
    id: "4",
    title: "Thriller",
    artist: "Michael Jackson",
    year: 1982,
    imageUrl: "https://picsum.photos/seed/thriller/300/300",
    tracks: [],
  },
  {
    id: "5",
    title: "Kind of Blue",
    artist: "Miles Davis",
    year: 1959,
    imageUrl: "https://picsum.photos/seed/kob/300/300",
    tracks: [],
  },
  {
    id: "6",
    title: "Rumours",
    artist: "Fleetwood Mac",
    year: 1977,
    imageUrl: "https://picsum.photos/seed/rumours/300/300",
    tracks: [],
  },
];

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
        gridTemplateColumns: "repeat(3, 1fr)",
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
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  theme={theme}
                  onAlbumSelect={() => {}}
                  onTrackPlay={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
