import { useState } from "react";
import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotKit,
} from "@copilotkit/react-core/v2";
import { ExampleLayout } from "@/components/example-layout";
import { PmBoard } from "@/components/pm-board";
import { ThreadsDrawer } from "@/components/threads-drawer";
import { ThemeShell } from "@/components/theme-shell";
import { AgentSelector, type AgentId } from "@/components/agent-selector";
import { EventInspector } from "@/components/event-inspector";
import { ThemeProvider } from "@/hooks/use-theme";
import { useExampleSuggestions, useGenerativeUIExamples } from "@/hooks";
import { demonstrationCatalog } from "@/declarative-generative-ui/renderers";
import styles from "@/components/threads-drawer/threads-drawer.module.css";

const runtimeUrl = "/api/copilotkit";

function HomePage() {
  useGenerativeUIExamples();
  useExampleSuggestions();

  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [agentId, setAgentId] = useState<AgentId>("langgraph");

  return (
    <ThemeShell>
      <div className={styles.layout}>
        <ThreadsDrawer
          agentId={agentId}
          threadId={threadId}
          onThreadChange={setThreadId}
        />
        <div className={styles.mainPanel}>
          {/*
            Share a single CopilotChatConfigurationProvider across chat + board
            so useAgent() resolves to the same per-thread agent clone. Switching
            agentId here remounts the chat against the new backend.
          */}
          <CopilotChatConfigurationProvider
            key={agentId}
            agentId={agentId}
            threadId={threadId}
          >
            <ExampleLayout
              chatHeader={
                <AgentSelector
                  agentId={agentId}
                  onChange={(id) => {
                    setAgentId(id);
                    setThreadId(undefined);
                  }}
                />
              }
              chatContent={
                <CopilotChat
                  input={{ disclaimer: () => null, className: "pb-6" }}
                  attachments={{
                    enabled: true,
                    accept: "image/*,application/pdf",
                    maxSize: 10 * 1024 * 1024,
                    onUploadFailed: (err) =>
                      console.warn("[attachments]", err.reason, err.message),
                  }}
                />
              }
              appContent={<PmBoard />}
            />
            <EventInspector />
          </CopilotChatConfigurationProvider>
        </div>
      </div>
    </ThemeShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CopilotKit
        runtimeUrl={runtimeUrl}
        a2ui={{ catalog: demonstrationCatalog }}
        openGenerativeUI={{}}
        useSingleEndpoint={false}
      >
        <HomePage />
      </CopilotKit>
    </ThemeProvider>
  );
}
