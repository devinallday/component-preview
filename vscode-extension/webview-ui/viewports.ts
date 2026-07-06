import type {
  BackdropId,
  ViewportPreset,
  ZoomId,
} from "../src/webviewProtocol";

export const VIEWPORTS: ViewportPreset[] = [
  { id: "responsive", label: "Responsive (fill)", width: null, height: null },
  { id: "mobile-s", label: "Mobile S — 320", width: 320, height: 568 },
  { id: "mobile-l", label: "Mobile L — 414", width: 414, height: 896 },
  { id: "tablet", label: "Tablet — 768", width: 768, height: 1024 },
  { id: "laptop", label: "Laptop — 1024", width: 1024, height: 768 },
  { id: "desktop", label: "Desktop — 1440", width: 1440, height: 900 },
  { id: "custom", label: "Custom", width: null, height: null },
];

export const ZOOM_OPTIONS: { value: ZoomId; label: string }[] = [
  { value: "fit", label: "Fit" },
  { value: "0.5", label: "50%" },
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" },
];

export const BACKDROPS: { value: BackdropId; label: string }[] = [
  { value: "editor", label: "Editor" },
  { value: "checker", label: "Checkerboard" },
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
];
