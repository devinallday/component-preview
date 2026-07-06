// Golden metadata for TrackMenuModal — AXIS: portal / modal.
// CAVEAT: this modal renders via createPortal into document.body, OUTSIDE
// #root. A verify gate that only inspects #root content will NOT see this
// text; it must look at the full document body when the modal is open.
export const targetStates: string[] = ["open"];

export const assertions: { state: string; mustContain?: string[] }[] = [
  { state: "open", mustContain: ["Bohemian Rhapsody", "Add to queue"] },
];
