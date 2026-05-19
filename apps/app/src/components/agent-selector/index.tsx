"use client";

import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type AgentId = "langgraph" | "adk";

interface AgentSelectorProps {
  agentId: AgentId;
  onChange: (id: AgentId) => void;
}

const AGENTS: { id: AgentId; label: string; subtitle: string }[] = [
  { id: "langgraph", label: "Cowork", subtitle: "LangGraph Agent" },
  { id: "adk", label: "Dashboard Designer", subtitle: "ADK Agent" },
];

/**
 * Glass pill dropdown for switching the active backend agent. Same UI for
 * both — the selector just changes which agent the runtime routes to.
 *
 * The dropdown panel is portaled into document.body and absolutely positioned
 * from the trigger's getBoundingClientRect(). The example-layout chat panel
 * carries `overflow: hidden` (needed for the glass-card border radius), so an
 * in-tree absolute dropdown would get clipped on the right edge — see the
 * issue thread for the "Dashboard Designer" clip. Portalling escapes the
 * clip without forcing the parent to drop overflow:hidden.
 */
export function AgentSelector({ agentId, onChange }: AgentSelectorProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const active = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];

  // Recompute the menu position whenever it opens. Using useLayoutEffect so
  // the menu paints in the right spot on the first frame (no flicker from
  // top: 0 / left: 0 → measured rect).
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.left });
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          background: "rgba(255, 255, 255, 0.65)",
          border: "1px solid #dbdbe5",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          color: "var(--text-primary)",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            color: "#838389",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Agent
        </span>
        <span>{active.label}</span>
        <ChevronDown
          style={{
            width: 12,
            height: 12,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 140ms ease",
          }}
        />
      </button>
      {open &&
        menuPos &&
        createPortal(
          <>
            <div
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 40,
              }}
            />
            <div
              style={{
                position: "fixed",
                top: menuPos.top,
                left: menuPos.left,
                minWidth: 240,
                background: "#ffffff",
                border: "1px solid #dbdbe5",
                borderRadius: 4,
                boxShadow: "0px 6px 6px -2px rgba(1, 5, 7, 0.08)",
                padding: 4,
                zIndex: 50,
              }}
            >
              {AGENTS.map((a) => {
                const isActive = a.id === agentId;
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      onChange(a.id);
                      setOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 4,
                      background: isActive ? "#f0f0f4" : "transparent",
                      border: 0,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "#f7f7f9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.label}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>
                      {a.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
