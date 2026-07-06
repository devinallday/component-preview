import type { ActionsProps } from "./contracts";

export function Actions(props: ActionsProps) {
  return (
    <div className="group">
      <button className="icon" title="Reload preview" onClick={props.onReload}>
        {"\u21BB"}
      </button>
      <button
        className="icon"
        title="Open in browser"
        onClick={props.onOpenExternal}
      >
        {"\u2197"}
      </button>
      <button
        className="primary"
        title="Regenerate the mock with AI"
        onClick={props.onRemock}
      >
        Re-mock
      </button>
    </div>
  );
}
