// Golden metadata for NowPlayingBar — AXIS: multiple / nested contexts.
// Requires BOTH <PlayerProvider> and <ThemeProvider> to render without
// throwing. With no current track (the PlayerProvider default), it shows a
// placeholder; a mock can call playTrack to surface a track title.
export const targetStates: string[] = ["default"];

export const assertions: { state: string; mustContain?: string[] }[] = [
  { state: "default", mustContain: ["Nothing playing", "Play"] },
];
