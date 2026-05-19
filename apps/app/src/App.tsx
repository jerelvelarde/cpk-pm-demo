import { useState } from "react";
import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotKit,
  CopilotKitProvider,
} from "@copilotkit/react-core/v2";
import { ExampleLayout } from "@/components/example-layout";
import { PmBoard } from "@/components/pm-board";
import { ThreadsDrawer } from "@/components/threads-drawer";
import { ThemeShell } from "@/components/theme-shell";
import { ThemeProvider } from "@/hooks/use-theme";
import { useExampleSuggestions, useGenerativeUIExamples } from "@/hooks";
import { demonstrationCatalog } from "@/declarative-generative-ui/renderers";
import styles from "@/components/threads-drawer/threads-drawer.module.css";

const runtimeUrl = "/api/copilotkit";

function HomePage() {
  useGenerativeUIExamples();
  useExampleSuggestions();

  const [threadId, setThreadId] = useState<string | undefined>(undefined);

  return (
    <ThemeShell>
      <div className={styles.layout}>
        <ThreadsDrawer
          agentId="default"
          threadId={threadId}
          onThreadChange={setThreadId}
        />
        <div className={styles.mainPanel}>
          {/*
            Wrap chat and board in one CopilotChatConfigurationProvider so they
            share the active threadId. useAgent() falls back to the provider's
            threadId, which makes the board read from the same per-thread agent
            clone that /connect populates.
          */}
          <CopilotChatConfigurationProvider agentId="default" threadId={threadId}>
            <ExampleLayout
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
