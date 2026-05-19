import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export const useExampleSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Plan next sprint",
        message:
          "Look at the backlog and propose 3-4 high-priority issues to pull into next sprint. Walk me through each one so I can approve.",
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
    ],
    available: "always",
  });
};
