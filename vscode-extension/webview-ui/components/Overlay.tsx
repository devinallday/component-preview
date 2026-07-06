import type { OverlayProps } from "./contracts";

export function Overlay(props: OverlayProps) {
  return (
    <div className={"overlay" + (props.visible ? " show" : "")}>
      <div className="spinner" />
      <div className="msg">{props.message}</div>
      {props.detail ? <div className="sub">{props.detail}</div> : null}
    </div>
  );
}
