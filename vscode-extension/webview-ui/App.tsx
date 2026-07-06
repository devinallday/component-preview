import { useCallback, useEffect, useMemo, useState } from "react";
import type { BackdropId, PreviewUiState, ZoomId } from "../src/webviewProtocol";
import { getInit, loadState, postToExtension, saveState } from "./vscodeApi";
import { VIEWPORTS } from "./viewports";
import { Toolbar } from "./components/Toolbar";
import { Stage } from "./components/Stage";

const DEFAULT_STATE: PreviewUiState = {
  viewportId: "responsive",
  customWidth: 1024,
  customHeight: 768,
  // Fit-to-panel by default so large viewports scale down instead of overflowing.
  zoom: "fit",
  theme: "dark",
  backdrop: "editor",
  orientation: false,
};

export function App() {
  const init = useMemo(getInit, []);
  const [state, setState] = useState<PreviewUiState>(() => ({
    ...DEFAULT_STATE,
    ...loadState(),
  }));
  const [effectiveZoom, setEffectiveZoom] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState<{ message: string; detail?: string } | null>(
    null,
  );

  // Persist toolbar state across reloads / panel hide.
  useEffect(() => saveState(state), [state]);

  const patch = useCallback(
    (delta: Partial<PreviewUiState>) => setState((s) => ({ ...s, ...delta })),
    [],
  );

  const responsive = state.viewportId === "responsive";
  const preset =
    VIEWPORTS.find((v) => v.id === state.viewportId) ?? VIEWPORTS[0];

  // Logical size shown in the inputs and used by the stage (orientation applied).
  const { width, height } = useMemo(() => {
    if (responsive) return { width: 0, height: 0 };
    let w: number;
    let h: number;
    if (state.viewportId === "custom" || preset.width == null) {
      w = state.customWidth;
      h = state.customHeight;
    } else {
      w = preset.width;
      h = preset.height ?? state.customHeight;
    }
    return state.orientation ? { width: h, height: w } : { width: w, height: h };
  }, [
    responsive,
    state.viewportId,
    state.customWidth,
    state.customHeight,
    state.orientation,
    preset,
  ]);

  const dims = responsive
    ? "Responsive"
    : `${width} × ${height}` +
      (effectiveZoom !== 1 ? `  @ ${Math.round(effectiveZoom * 100)}%` : "");

  const onCustomSize = useCallback(
    (w: number, h: number) => {
      // Inputs show orientation-applied values; store the un-rotated pair so
      // rotate stays a pure toggle.
      setState((s) =>
        s.orientation
          ? { ...s, viewportId: "custom", customWidth: h, customHeight: w }
          : { ...s, viewportId: "custom", customWidth: w, customHeight: h },
      );
    },
    [],
  );

  const onRemock = useCallback(() => {
    setBusy({
      message: "Regenerating mock with AI…",
      detail: "This calls the model and restarts the dev server.",
    });
    postToExtension({ type: "remock" });
  }, []);

  return (
    <div className="wrap">
      <Toolbar
        presets={VIEWPORTS}
        viewportId={state.viewportId}
        width={width}
        height={height}
        editable={!responsive}
        onSelectPreset={(id) => patch({ viewportId: id })}
        onCustomSize={onCustomSize}
        onToggleOrientation={() => patch({ orientation: !state.orientation })}
        zoom={state.zoom}
        onZoomChange={(zoom: ZoomId) => patch({ zoom })}
        theme={state.theme}
        onThemeToggle={() =>
          patch({ theme: state.theme === "dark" ? "light" : "dark" })
        }
        backdrop={state.backdrop}
        onBackdropChange={(backdrop: BackdropId) => patch({ backdrop })}
        dims={dims}
        onReload={() => setReloadKey((k) => k + 1)}
        onOpenExternal={() => postToExtension({ type: "openExternal" })}
        onRemock={onRemock}
      />
      <Stage
        url={init.url}
        theme={state.theme}
        backdrop={state.backdrop}
        responsive={responsive}
        width={width || 1}
        height={height || 1}
        zoom={state.zoom}
        reloadKey={reloadKey}
        busy={busy}
        onEffectiveZoom={setEffectiveZoom}
      />
    </div>
  );
}
