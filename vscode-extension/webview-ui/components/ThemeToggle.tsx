import type { ThemeToggleProps } from "./contracts";

export function ThemeToggle(props: ThemeToggleProps) {
  return (
    <div className="group">
      <label className="lbl">Theme</label>
      <button title="Toggle light / dark" onClick={props.onToggle}>
        {props.theme === "dark" ? "\u263D Dark" : "\u263C Light"}
      </button>
    </div>
  );
}
