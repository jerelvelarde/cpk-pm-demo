"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type AgentId = "langgraph" | "adk";

interface AgentSelectorProps {
  agentId: AgentId;
  onChange: (id: AgentId) => void;
}

const AGENTS: { id: AgentId; label: string; subtitle: string }[] = [
  { id: "langgraph", label: "LangGraph", subtitle: "Python · openai:gpt-4.1" },
  { id: "adk", label: "Google ADK", subtitle: "Python · same tool surface" },
];

/**
 * Glass pill dropdown for switching the active backend agent. Same UI for
 * both — the selector just changes which agent the runtime routes to.
 */
export function AgentSelector({ agentId, onChange }: AgentSelectorProps) {
  const [open, setOpen] = useState(false);
  const active = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];

  return (
    <div style={{ position: "relative" }}>
      <button
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
      {open && (
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
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              minWidth: 220,
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
        </>
      )}
    </div>
  );
}
