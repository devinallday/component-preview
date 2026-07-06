import React, { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";
import type { ThemeContextType } from "./ThemeContext";
import {
  getPreviewThemeFromQuery,
  subscribeToPreviewTheme,
} from "./previewThemeBridge";

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: "light" | "dark";
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "dark",
}) => {
  // Seed from the Component Preview webview's `?previewTheme=` param when
  // present; otherwise honor the caller-provided initialTheme. This keeps
  // normal app usage completely unaffected (getter returns null off-preview).
  const [theme, setTheme] = useState<"light" | "dark">(
    () => getPreviewThemeFromQuery() ?? initialTheme,
  );

  // Honor live theme toggles from the preview webview (set-theme postMessage).
  // The listener is inert during normal app usage — it only reacts to the
  // component-preview message — so this is additive and safe.
  useEffect(() => subscribeToPreviewTheme(setTheme), []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
