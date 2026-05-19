"use client";

import { ReactNode, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { useFrontendTool } from "@copilotkit/react-core";

interface ExampleLayoutProps {
  chatContent: ReactNode;
  appContent: ReactNode;
  chatHeader?: ReactNode;
}

export function ExampleLayout({
  chatContent,
  appContent,
  chatHeader,
}: ExampleLayoutProps) {
  const [mode, setMode] = useState<"chat" | "app">("app");

  useFrontendTool({
    name: "enableAppMode",
    description:
      "Open the kanban board (app mode). Call this whenever the user wants to see, edit, or talk about issues.",
    handler: async () => {
      setMode("app");
    },
  });

  useFrontendTool({
    name: "enableChatMode",
    description: "Close the kanban board and focus on chat.",
    handler: async () => {
      setMode("chat");
    },
  });

  return (
    <div
      className="h-full flex flex-row"
      style={{ height: "calc(100dvh - 16px)" }}
    >
      <ModeToggle mode={mode} onModeChange={setMode} />

      {/* Chat panel — glass card */}
      <div
        className={`max-h-full flex flex-col ${
          mode === "app" ? "w-[420px] max-lg:hidden" : "flex-1"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.5)",
          border: "2px solid #ffffff",
          borderRadius: 8,
          marginRight: 8,
          overflow: "hidden",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="shrink-0 pt-5 pl-5 pr-4 pb-2 max-lg:pl-4 max-lg:pt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/copilotkit-logo.svg"
              alt="CopilotKit"
              className="h-6"
            />
            <span
              style={{
                fontSize: 18,
                fontWeight: 300,
                color: "var(--text-primary)",
                marginLeft: 4,
              }}
            >
              PM Copilot
            </span>
          </div>
          {chatHeader}
        </div>
        <div
          className={`flex-1 min-h-0 overflow-y-auto ${
            mode === "app" ? "px-4" : "max-lg:px-4"
          }`}
        >
          {chatContent}
        </div>
      </div>

      {/* Board panel */}
      <div
        className={`h-full overflow-hidden flex-1 ${
          mode === "app" ? "max-lg:w-full" : "w-0"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          border: mode === "app" ? "2px solid #ffffff" : "0",
          borderRadius: 8,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="w-full h-full">{appContent}</div>
      </div>
    </div>
  );
}
