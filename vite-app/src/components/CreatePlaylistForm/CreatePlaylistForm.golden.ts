// Golden metadata for CreatePlaylistForm — AXIS: controlled form + validation.
//   invalid -> after touching an empty name, an inline error appears and the
//              submit button is disabled.
//   valid   -> after typing a valid name, submit is enabled.
export const targetStates: string[] = ["invalid", "valid"];

export const assertions: { state: string; mustContain?: string[] }[] = [
  { state: "invalid", mustContain: ["Playlist name is required"] },
  { state: "valid", mustContain: ["Create playlist"] },
];
