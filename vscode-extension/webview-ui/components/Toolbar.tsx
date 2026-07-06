import type {
  BackdropId,
  PreviewTheme,
  ViewportPreset,
  ZoomId,
} from "../../src/webviewProtocol";
import { ViewportControl } from "./ViewportControl";
import { ZoomControl } from "./ZoomControl";
import { ThemeToggle } from "./ThemeToggle";
import { BackdropControl } from "./BackdropControl";
import { Actions } from "./Actions";

export interface ToolbarProps {
  // viewport
  presets: ViewportPreset[];
  viewportId: string;
  width: number;
  height: number;
  editable: boolean;
  onSelectPreset: (id: string) => void;
  onCustomSize: (width: number, height: number) => void;
  onToggleOrientation: () => void;
  // zoom
  zoom: ZoomId;
  onZoomChange: (zoom: ZoomId) => void;
  // theme / backdrop
  theme: PreviewTheme;
  onThemeToggle: () => void;
  backdrop: BackdropId;
  onBackdropChange: (backdrop: BackdropId) => void;
  // readout + actions
  dims: string;
  onReload: () => void;
  onOpenExternal: () => void;
  onRemock: () => void;
}

export function Toolbar(props: ToolbarProps) {
  return (
    <div className="toolbar">
      <ViewportControl
        presets={props.presets}
        viewportId={props.viewportId}
        width={props.width}
        height={props.height}
        editable={props.editable}
        onSelectPreset={props.onSelectPreset}
        onCustomSize={props.onCustomSize}
        onToggleOrientation={props.onToggleOrientation}
      />
      <ZoomControl zoom={props.zoom} onChange={props.onZoomChange} />
      <ThemeToggle theme={props.theme} onToggle={props.onThemeToggle} />
      <BackdropControl
        backdrop={props.backdrop}
        onChange={props.onBackdropChange}
      />
      <span className="spacer" />
      <div className="group">
        <span className="dims">{props.dims}</span>
      </div>
      <Actions
        onReload={props.onReload}
        onOpenExternal={props.onOpenExternal}
        onRemock={props.onRemock}
      />
    </div>
  );
}
