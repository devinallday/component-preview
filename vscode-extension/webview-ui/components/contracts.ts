// Prop contracts for the presentational toolbar components. These are the seam
// between the container (App/Toolbar/Stage) and the leaf controls, so the leaves
// can stay pure (props in, callbacks out) and be built independently.
//
// OWNERSHIP: fan-out workstream B (Webview / UX).

import type {
  BackdropId,
  PreviewTheme,
  ViewportPreset,
  ZoomId,
} from "../../src/webviewProtocol";

export interface ViewportControlProps {
  /** All selectable presets (includes "responsive" and a synthetic "custom"). */
  presets: ViewportPreset[];
  /** Currently selected preset id (a preset id or "custom"). */
  viewportId: string;
  /** Effective logical width shown in the W input. */
  width: number;
  /** Effective logical height shown in the H input. */
  height: number;
  /** Whether the W/H inputs are editable (false in responsive mode). */
  editable: boolean;
  /** User picked a preset from the dropdown. */
  onSelectPreset: (id: string) => void;
  /** User edited the W/H inputs (values are the on-screen, un-rotated numbers). */
  onCustomSize: (width: number, height: number) => void;
  /** User clicked the rotate button. */
  onToggleOrientation: () => void;
}

export interface ZoomControlProps {
  zoom: ZoomId;
  onChange: (zoom: ZoomId) => void;
}

export interface ThemeToggleProps {
  theme: PreviewTheme;
  onToggle: () => void;
}

export interface BackdropControlProps {
  backdrop: BackdropId;
  onChange: (backdrop: BackdropId) => void;
}

export interface ActionsProps {
  onReload: () => void;
  onOpenExternal: () => void;
  onRemock: () => void;
}

export interface OverlayProps {
  visible: boolean;
  message: string;
  detail?: string;
}
