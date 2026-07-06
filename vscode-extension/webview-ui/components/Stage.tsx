import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  BackdropId,
  PreviewTheme,
  SetThemeMessage,
  ZoomId,
} from "../../src/webviewProtocol";
import { Overlay } from "./Overlay";

export interface StageProps {
  url: string;
  theme: PreviewTheme;
  backdrop: BackdropId;
  responsive: boolean;
  /** Logical (orientation-applied) frame size, ignored in responsive mode. */
  width: number;
  height: number;
  zoom: ZoomId;
  /** Bump to force the iframe to reload. */
  reloadKey: number;
  /** When set, an overlay is shown (e.g. during re-mock). */
  busy: { message: string; detail?: string } | null;
  /** Reports the actually-applied zoom so the toolbar can show it. */
  onEffectiveZoom: (zoom: number) => void;
}

const STAGE_PADDING = 48; // 2 * --pad; matches styles.css

export function Stage(props: StageProps) {
  const {
    url,
    theme,
    backdrop,
    responsive,
    width,
    height,
    zoom,
    reloadKey,
    busy,
    onEffectiveZoom,
  } = props;

  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const themeRef = useRef<PreviewTheme>(theme);
  themeRef.current = theme;

  const [effectiveZoom, setEffectiveZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [slowHint, setSlowHint] = useState(false);

  // Post the theme signal into the cross-origin preview iframe (theme bridge, D18).
  function postTheme(next: PreviewTheme) {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const msg: SetThemeMessage = {
      source: "component-preview",
      type: "set-theme",
      theme: next,
    };
    win.postMessage(msg, "*");
  }

  // (Re)load the iframe when the URL or reloadKey changes. Theme is seeded via the
  // query param for a flash-free first paint; live toggles use postMessage instead.
  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame || !url) return;
    setLoading(true);
    setSlowHint(false);
    const sep = url.indexOf("?") === -1 ? "?" : "&";
    frame.src = `${url}${sep}previewTheme=${themeRef.current}&_t=${Date.now()}`;
    const slow = window.setTimeout(() => setSlowHint(true), 8000);
    return () => window.clearTimeout(slow);
  }, [url, reloadKey]);

  // Live theme toggle: no reload, just re-signal the running app.
  useEffect(() => {
    postTheme(theme);
  }, [theme]);

  // Compute the applied zoom. "fit" scales the frame down to the stage; recomputed
  // on stage resize so it always fits the current panel size.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    function recompute() {
      if (responsive) {
        setEffectiveZoom(1);
        return;
      }
      if (zoom !== "fit") {
        setEffectiveZoom(parseFloat(zoom) || 1);
        return;
      }
      if (!stage) return;
      const availW = Math.max(120, stage.clientWidth - STAGE_PADDING);
      const availH = Math.max(120, stage.clientHeight - STAGE_PADDING);
      setEffectiveZoom(Math.min(1, availW / width, availH / height));
    }
    recompute();
    if (!stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(recompute);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [responsive, width, height, zoom]);

  useEffect(() => {
    onEffectiveZoom(effectiveZoom);
  }, [effectiveZoom, onEffectiveZoom]);

  const stageClass =
    "stage bd-" +
    backdrop +
    (responsive ? " responsive" : " center-v");

  const frameStyle = responsive
    ? undefined
    : {
        width: `${width}px`,
        height: `${height}px`,
        transform: `scale(${effectiveZoom})`,
      };
  const sizerStyle = responsive
    ? undefined
    : {
        width: `${Math.round(width * effectiveZoom)}px`,
        height: `${Math.round(height * effectiveZoom)}px`,
      };

  const overlayVisible = loading || busy !== null;
  const overlayMessage = busy?.message ?? "Loading preview…";
  const overlayDetail =
    busy?.detail ??
    (slowHint
      ? "Taking longer than expected — the dev server may still be starting. Try Reload."
      : undefined);

  return (
    <div className={stageClass} ref={stageRef}>
      <div className="sizer" style={sizerStyle}>
        <div className="frame" style={frameStyle}>
          <iframe
            ref={iframeRef}
            title="Component preview"
            onLoad={() => {
              setLoading(false);
              setSlowHint(false);
              postTheme(themeRef.current);
            }}
          />
        </div>
      </div>
      <Overlay
        visible={overlayVisible}
        message={overlayMessage}
        detail={overlayDetail}
      />
    </div>
  );
}
