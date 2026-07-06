import type { ZoomId } from "../../src/webviewProtocol";
import { ZOOM_OPTIONS } from "../viewports";
import type { ZoomControlProps } from "./contracts";

export function ZoomControl(props: ZoomControlProps) {
  return (
    <div className="group">
      <label className="lbl">Zoom</label>
      <select
        value={props.zoom}
        onChange={(e) => props.onChange(e.target.value as ZoomId)}
      >
        {ZOOM_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
