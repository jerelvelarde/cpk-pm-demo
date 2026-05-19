"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Check, FileText } from "lucide-react";

/**
 * Schema for the attachMeetingNotes frontend tool. The LLM passes the
 * filename + size + body; the component animates an "attaching… → attached"
 * card and reveals the body inline.
 *
 * The animation is purely visual (not gated on streaming status) so the
 * mock-mode demo plays out consistently regardless of how fast the fixture
 * streams.
 */
export const AttachMeetingNotesProps = z.object({
  filename: z
    .string()
    .describe("Display filename, e.g. Sprint Cycle 52 Meeting Notes.txt"),
  size: z
    .string()
    .describe("Display size, e.g. 2.4 KB. Purely cosmetic."),
  content: z
    .string()
    .describe("Body text of the document, rendered in the expandable panel."),
});

export type AttachMeetingNotesArgs = z.infer<typeof AttachMeetingNotesProps>;

const ATTACH_DURATION_MS = 1200;

export function AttachMeetingNotes({
  filename,
  size,
  content,
}: AttachMeetingNotesArgs) {
  const [phase, setPhase] = useState<"attaching" | "attached">("attaching");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase("attached"), ATTACH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="max-w-md w-full"
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        border: "2px solid #ffffff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "0px 1px 3px 0px rgba(1, 5, 7, 0.08)",
      }}
    >
      <style>{`
        @keyframes attachShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
        @keyframes attachIconPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes attachCheckPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes attachContentSlide {
          from { opacity: 0; transform: translateY(-4px); max-height: 0; }
          to   { opacity: 1; transform: translateY(0);    max-height: 320px; }
        }
      `}</style>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center flex-none rounded-md"
          style={{
            width: 36,
            height: 36,
            background: "#ffffff",
            border: "1px solid #dbdbe5",
            animation:
              phase === "attaching"
                ? "attachIconPulse 1.2s ease-in-out infinite"
                : undefined,
          }}
        >
          <FileText
            className="h-4 w-4"
            style={{ color: phase === "attached" ? "#189370" : "#57575b" }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#010507",
              lineHeight: 1.25,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {filename}
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{ fontSize: 11, color: "#57575b", marginTop: 2 }}
          >
            {size && <span>{size}</span>}
            {size && <span style={{ color: "#dbdbe5" }}>·</span>}
            {phase === "attaching" ? (
              <span>Attaching…</span>
            ) : (
              <span
                className="inline-flex items-center gap-1"
                style={{ color: "#189370", fontWeight: 500 }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    background: "#189370",
                    animation: "attachCheckPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </span>
                Attached
              </span>
            )}
          </div>
        </div>

        {phase === "attached" && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer flex-none"
            style={{
              padding: "4px 10px",
              border: "1px solid #dbdbe5",
              borderRadius: 6,
              background: "#ffffff",
              fontSize: 11,
              fontWeight: 500,
              color: "#010507",
            }}
          >
            {expanded ? "Hide" : "Show notes"}
          </button>
        )}
      </div>

      {phase === "attaching" && (
        <div
          style={{
            marginTop: 10,
            height: 4,
            background: "rgba(190, 194, 255, 0.25)",
            borderRadius: 999,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "45%",
              background:
                "linear-gradient(90deg, transparent 0%, #bec2ff 50%, transparent 100%)",
              animation: "attachShimmer 1.2s ease-in-out infinite",
              borderRadius: 999,
            }}
          />
        </div>
      )}

      {phase === "attached" && expanded && (
        <pre
          style={{
            marginTop: 10,
            padding: 10,
            background: "#ffffff",
            border: "1px solid #dbdbe5",
            borderRadius: 6,
            fontFamily: "Spline Sans Mono, ui-monospace, monospace",
            fontSize: 11,
            lineHeight: 1.55,
            color: "#010507",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: 320,
            overflow: "auto",
            animation: "attachContentSlide 0.32s ease-out",
          }}
        >
          {content}
        </pre>
      )}
    </div>
  );
}
