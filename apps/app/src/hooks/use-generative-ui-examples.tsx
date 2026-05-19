import { z } from "zod";
import { useTheme } from "@/hooks/use-theme";

import {
  useComponent,
  useFrontendTool,
  useHumanInTheLoop,
  useDefaultRenderTool,
} from "@copilotkit/react-core/v2";

import {
  PieChart,
  PieChartProps,
} from "@/components/generative-ui/charts/pie-chart";
import {
  BarChart,
  BarChartProps,
} from "@/components/generative-ui/charts/bar-chart";
import { MeetingTimePicker } from "@/components/generative-ui/meeting-time-picker";
import {
  IssueCardChip,
  IssueCardProps,
} from "@/components/generative-ui/issue-card";
import {
  IssueList,
  IssueListProps,
} from "@/components/generative-ui/issue-list";
import {
  AgentProgress,
  AgentProgressProps,
} from "@/components/generative-ui/agent-progress";
import { ApprovalCard } from "@/components/generative-ui/approval-card";
import { ToolReasoning } from "@/components/tool-rendering";

export const useGenerativeUIExamples = () => {
  const { theme, setTheme } = useTheme();

  // Human-in-the-Loop (frontend tool requiring user decision)
  useHumanInTheLoop({
    name: "scheduleTime",
    description: "Use human-in-the-loop to schedule a meeting with the user.",
    parameters: z.object({
      reasonForScheduling: z
        .string()
        .describe("Reason for scheduling, very brief - 5 words."),
      meetingDuration: z
        .number()
        .describe("Duration of the meeting in minutes"),
    }),
    render: ({ respond, status, args }) => {
      return <MeetingTimePicker status={status} respond={respond} {...args} />;
    },
  });

  // HITL for single-issue mutations. Pairs with the agent's
  // propose_issue_change tool — agent calls that, frontend renders the
  // approval card here, user accepts / edits / rejects.
  useHumanInTheLoop({
    name: "proposeIssueMutation",
    description:
      "Ask the user to approve a mutation to a single issue. Use for any single-issue change (status move, assignee, priority).",
    parameters: z.object({
      issueId: z.string().describe("The issue id, e.g. ISS-101"),
      changes: z
        .object({
          status: z
            .enum(["Backlog", "Todo", "In Progress", "In Review", "Done"])
            .optional(),
          priority: z.enum(["Urgent", "High", "Med", "Low"]).optional(),
          assignee: z.string().nullable().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
        })
        .describe("The partial issue changes to apply on accept."),
    }),
    render: ({ respond, status, args }) => {
      return (
        <ApprovalCard
          status={status}
          respond={respond}
          issueId={args.issueId}
          changes={args.changes ?? {}}
        />
      );
    },
  });

  // Controlled Generative UI (frontend-defined chart components)
  useComponent({
    name: "pieChart",
    description: "Controlled Generative UI that displays data as a pie chart.",
    parameters: PieChartProps,
    render: PieChart,
  });

  useComponent({
    name: "barChart",
    description: "Controlled Generative UI that displays data as a bar chart.",
    parameters: BarChartProps,
    render: BarChart,
  });

  useComponent({
    name: "issueCard",
    description:
      "Render a single project issue as an inline glass card with a 'View on board' button.",
    parameters: IssueCardProps,
    render: IssueCardChip,
  });

  useComponent({
    name: "issueList",
    description:
      "Call this to surface a list of issues inline in chat as glass cards. Use it whenever the user asks to 'show', 'list', or 'see' specific issues. Pass issueIds with the ids you want to surface (e.g. all urgent issues, all unassigned issues, the ones you just edited) — the frontend looks them up in agent state. Call get_issues first if you don't already have the ids.",
    parameters: IssueListProps,
    render: IssueList,
  });

  // Sprint-planning progress narration. Each call renders a single animated
  // step card (spinner -> green check) so the chain reads as "reading image ->
  // transcribing -> planning tickets -> writing tickets" before the actual
  // manage_issues mutation lands. Purely visual; the agent (or fixture) emits
  // one tool call per step.
  useComponent({
    name: "agentProgress",
    description:
      "Narrate a single step of a longer agent workflow as an animated progress card. Call once per step in sequence. Used by the sprint-planning demo to show 'reading image', 'transcribing', 'planning tickets', 'writing tickets'.",
    parameters: AgentProgressProps,
    render: AgentProgress,
  });

  // Default Tool Rendering (backend tool UI)
  const ignoredTools = ["render_a2ui", "generate_a2ui", "log_a2ui_event"];
  useDefaultRenderTool({
    render: ({ name, status, parameters }) => {
      if (ignoredTools.includes(name)) return <></>;
      return <ToolReasoning name={name} status={status} args={parameters} />;
    },
  });

  // Frontend Tools (direct frontend state manipulation)
  useFrontendTool(
    {
      name: "toggleTheme",
      description:
        "Frontend tool for toggling between the two CopilotKit glass-density variants (light / frosted).",
      parameters: z.object({}),
      handler: async () => {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "light" : "dark");
      },
    },
    [theme, setTheme],
  );
};
