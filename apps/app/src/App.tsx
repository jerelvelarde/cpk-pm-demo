import { useCallback, useMemo, useState } from "react";
import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotKit,
  useAgent,
  useCopilotChatConfiguration,
  useCopilotKit,
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
import { buildSprintNotesMessageContent } from "@/lib/mock-sprint-notes";
import styles from "@/components/threads-drawer/threads-drawer.module.css";

/** Title of the suggestion chip that should auto-attach the sprint notes. */
const PLAN_SPRINT_SUGGESTION_TITLE = "Plan next sprint";

const runtimeUrl = "/api/copilotkit";

function ChatWired() {
  // Inside CopilotChatConfigurationProvider so useConfigureSuggestions and
  // useFrontendTool resolve against the active chat config's agentId. Hoisted
  // up to HomePage caused suggestions to register before the chat config was
  // available and the welcome-screen suggestion list rendered empty.
  useGenerativeUIExamples();
  useExampleSuggestions();

  const config = useCopilotChatConfiguration();
  const { agent } = useAgent({ agentId: config?.agentId });
  const { copilotkit } = useCopilotKit();

  // Slash commands. CopilotChatInput surfaces these in a popover when the
  // user types "/" and runs the matching item's action on Enter — bypassing
  // the LLM entirely, which is what you want for destructive shortcuts.
  const toolsMenu = useMemo(
    () => [
      {
        label: "clear",
        action: () => agent.setState({ issues: [] }),
      },
    ],
    [agent],
  );

  // Suggestion-click interceptor. The default <CopilotChat> behavior is to
  // post the chip's `message` as a plain-text user message and run the agent.
  // We override it for the "Plan next sprint" chip so the message also carries
  // a synthetic "Sprint Cycle 52 Meeting Notes.txt" attachment — same
  // multimodal shape that <CopilotChat>'s onSubmitInput produces when the user
  // actually drops a file into the input. CopilotKit then renders the file
  // chip above the user bubble via its built-in <DocumentAttachment>, and the
  // notes content flows into the LLM context so the agent (or its aimock
  // fixture) can act on it without the user having a real file to upload.
  //
  // Anything else falls through to the same agent.addMessage + runAgent flow
  // that CopilotChat uses internally — we have to replicate it here because
  // overriding `onSelectSuggestion` on the suggestionView slot drops the
  // built-in handler entirely (renderSlot spreads user props AFTER defaults).
  const handleSelectSuggestion = useCallback(
    async (suggestion: { title?: string; message: string }) => {
      const messageId = crypto.randomUUID();
      const isPlanSprint = suggestion.title === PLAN_SPRINT_SUGGESTION_TITLE;
      agent.addMessage({
        id: messageId,
        role: "user",
        content: isPlanSprint
          ? buildSprintNotesMessageContent(suggestion.message)
          : suggestion.message,
      });
      try {
        await copilotkit.runAgent({ agent });
      } catch (err) {
        console.error("[ChatWired] runAgent failed after suggestion", err);
      }
    },
    [agent, copilotkit],
  );

  return (
    <CopilotChat
      input={{ disclaimer: () => null, className: "pb-6", toolsMenu }}
      suggestionView={{ onSelectSuggestion: handleSelectSuggestion }}
      attachments={{
        enabled: true,
        accept: "image/*,application/pdf,text/plain",
        maxSize: 10 * 1024 * 1024,
        onUploadFailed: (err) =>
          console.warn("[attachments]", err.reason, err.message),
      }}
    />
  );
}

function HomePage() {
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
              chatContent={<ChatWired />}
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
