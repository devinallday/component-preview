import type { BackdropId } from "../../src/webviewProtocol";
import { BACKDROPS } from "../viewports";
import type { BackdropControlProps } from "./contracts";

export function BackdropControl(props: BackdropControlProps) {
  return (
    <div className="group">
      <label className="lbl">Backdrop</label>
      <select
        value={props.backdrop}
        onChange={(e) => props.onChange(e.target.value as BackdropId)}
      >
        {BACKDROPS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
