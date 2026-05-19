/**
 * Suggestion pills shown in the chat UI. Each suggestion triggers a specific
 * demo feature when clicked. These are PM-copilot themed.
 */
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export const useExampleSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Plan next sprint",
        message:
          "Enable app mode, then look at the current backlog and propose what we should pull into next sprint. Move 3-4 high priority issues into Todo using propose_issue_change so I can approve each one.",
      },
      {
        title: "Analyze backlog",
        message:
          "Use analyze_backlog to walk through what's in the backlog right now. Focus on what's blocking ship.",
      },
      {
        title: "Show me urgent issues",
        message:
          "Use render_issue_list to show me all Urgent priority issues inline in chat.",
      },
      {
        title: "Move ISS-101 to Done",
        message:
          "Use propose_issue_change to move ISS-101 to Done status — I'll approve via the card.",
      },
      {
        title: "Sketch the checkout redesign",
        message:
          "Use Excalidraw to sketch a quick wireframe for the new checkout flow with guest checkout and an upsell modal.",
      },
      {
        title: "Bar chart by status",
        message:
          "Show me a bar chart of issue counts by status. Use the query_data tool to fetch the data first, then render with the barChart component.",
      },
      {
        title: "Toggle theme",
        message:
          "Toggle the app theme between glass-light and glass-frosted using the toggleTheme tool.",
      },
    ],
    available: "always",
  });
};
