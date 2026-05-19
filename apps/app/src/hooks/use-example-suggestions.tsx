import {
  useConfigureSuggestions,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";

/**
 * Cowork (LangGraph) suggestions — kanban-board workflow.
 */
const COWORK_SUGGESTIONS = [
  {
    title: "Plan next sprint",
    message:
      "Plan the next sprint backlog using this meeting notes from our sprint planning.",
  },
  {
    title: "Analyze backlog",
    message: "Analyze the backlog and tell me what's blocking ship.",
  },
  {
    title: "Show me urgent issues",
    message: "Show me all the urgent issues right now.",
  },
  {
    title: "Move ISS-101 to Done",
    message: "Move ISS-101 to Done.",
  },
  {
    title: "Sketch the checkout redesign",
    message:
      "Sketch a guest-checkout flow with an upsell modal for our checkout redesign.",
  },
  {
    title: "Bar chart by status",
    message: "Show me a bar chart of issue counts by status.",
  },
  {
    title: "Toggle theme",
    message: "Toggle the app theme.",
  },
] as const;

/**
 * Dashboard Designer (ADK) suggestions — drive the stats dashboard via the
 * `updateDashboard` frontend tool. Each message reads like a real question
 * the user would ask; the agent picks the right filter and focus copy from
 * the tool description (see useGenerativeUIExamples.tsx).
 */
const DASHBOARD_SUGGESTIONS = [
  {
    title: "Sarah's workload",
    message: "Show me everything Sarah is on the hook for.",
  },
  {
    title: "Urgent right now",
    message: "Filter the dashboard to just the urgent issues.",
  },
  {
    title: "Who has the most work?",
    message: "Break down the dashboard by assignee — who's overloaded?",
  },
  {
    title: "What's in flight?",
    message: "Show me everything currently in progress.",
  },
  {
    title: "Reset the dashboard",
    message: "Reset the filter and show me the full backlog.",
  },
] as const;

export const useExampleSuggestions = () => {
  const config = useCopilotChatConfiguration();
  const isDashboard = config?.agentId === "adk";

  useConfigureSuggestions({
    suggestions: isDashboard
      ? [...DASHBOARD_SUGGESTIONS]
      : [...COWORK_SUGGESTIONS],
    available: "always",
  });
};
