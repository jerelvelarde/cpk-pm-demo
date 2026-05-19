interface ModeToggleProps {
  mode: "chat" | "app";
  onModeChange: (mode: "chat" | "app") => void;
}

/**
 * Top-right glass pill toggle. Active tab gets a white background — same
 * pattern as the dojo view-toggle tabs.
 */
export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex max-lg:top-2 max-lg:right-2 max-lg:scale-90"
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        border: "2px solid #ffffff",
        borderRadius: 8,
        padding: 2,
        gap: 2,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {(["chat", "app"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              height: 28,
              padding: "0 12px",
              border: 0,
              borderRadius: 6,
              background: active ? "#ffffff" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 140ms ease, color 140ms ease",
            }}
          >
            {m === "chat" ? "Chat" : "Board"}
          </button>
        );
      })}
    </div>
  );
}
