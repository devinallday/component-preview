import React, { useState, useEffect } from "react";

interface PreviewToolbarProps {
  children: React.ReactNode;
}

const SIZES = [
  { name: "Mobile", width: "375px" },
  { name: "Tablet", width: "768px" },
  { name: "Desktop", width: "100%" },
] as const;

export default function PreviewToolbar({ children }: PreviewToolbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [size, setSize] = useState<typeof SIZES[number]["width"]>("100%");

  useEffect(() => {
    // Apply theme to document
    const el = document.documentElement;
    el.setAttribute("data-theme", theme);
    el.classList.remove("light", "dark");
    el.classList.add(theme);
    el.style.colorScheme = theme;
  }, [theme]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 16px",
          background: theme === "dark" ? "#1e1e1e" : "#f5f5f5",
          borderBottom: `1px solid ${theme === "dark" ? "#333" : "#ddd"}`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "13px",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: theme === "dark" ? "#fff" : "#333",
          }}
        >
          Preview
        </span>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              color: theme === "dark" ? "#999" : "#666",
              fontSize: "12px",
            }}
          >
            Theme:
          </span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${theme === "dark" ? "#444" : "#ccc"}`,
              background: theme === "dark" ? "#2a2a2a" : "#fff",
              color: theme === "dark" ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              color: theme === "dark" ? "#999" : "#666",
              fontSize: "12px",
            }}
          >
            Size:
          </span>
          {SIZES.map((s) => (
            <button
              key={s.name}
              onClick={() => setSize(s.width)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: `1px solid ${
                  size === s.width
                    ? theme === "dark"
                      ? "#4ade80"
                      : "#22c55e"
                    : theme === "dark"
                    ? "#444"
                    : "#ccc"
                }`,
                background:
                  size === s.width
                    ? theme === "dark"
                      ? "#1a2e1a"
                      : "#f0fdf4"
                    : theme === "dark"
                    ? "#2a2a2a"
                    : "#fff",
                color: theme === "dark" ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "24px",
          background: theme === "dark" ? "#121212" : "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: size === "100%" ? "100%" : size,
            margin: "0 auto",
            border: size === "100%" ? "none" : `2px solid ${theme === "dark" ? "#444" : "#ddd"}`,
            borderRadius: size === "100%" ? "0" : "8px",
            boxShadow: size === "100%" ? "none" : theme === "dark" ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
