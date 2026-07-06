// Golden metadata for AsyncTrackList — AXIS: async loading / success / error.
// The verify gate forces each state via an injected `fetchTracks` prop:
//   loading -> a promise that never resolves
//   success -> a promise that resolves mockTracks
//   error   -> a promise that rejects
export const targetStates: string[] = ["loading", "success", "error"];

export const assertions: { state: string; mustContain?: string[] }[] = [
  { state: "loading", mustContain: ["Loading tracks"] },
  { state: "success", mustContain: ["Bohemian Rhapsody"] },
  { state: "error", mustContain: ["Failed to load tracks"] },
];
