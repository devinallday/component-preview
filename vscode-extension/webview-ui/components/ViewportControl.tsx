import type { ChangeEvent } from "react";
import type { ViewportControlProps } from "./contracts";

export function ViewportControl(props: ViewportControlProps) {
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value, 10);
    const height = props.height;
    if (width > 0 && height > 0) {
      props.onCustomSize(width, height);
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const width = props.width;
    const height = parseInt(e.target.value, 10);
    if (width > 0 && height > 0) {
      props.onCustomSize(width, height);
    }
  };

  return (
    <div className="group">
      <label className="lbl">Viewport</label>
      <select
        value={props.viewportId}
        onChange={(e) => props.onSelectPreset(e.target.value)}
      >
        {props.presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
      <input
        className="dim"
        type="number"
        min={120}
        title="Width (px)"
        value={props.width}
        disabled={!props.editable}
        onChange={handleWidthChange}
      />
      <span className="dims">×</span>
      <input
        className="dim"
        type="number"
        min={120}
        title="Height (px)"
        value={props.height}
        disabled={!props.editable}
        onChange={handleHeightChange}
      />
      <button
        className="icon"
        title="Rotate (swap width/height)"
        onClick={props.onToggleOrientation}
      >
        {"\u21C4"}
      </button>
    </div>
  );
}
