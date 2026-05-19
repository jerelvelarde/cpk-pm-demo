import { z } from "zod";
import { useTheme } from "@/hooks/use-theme";

import {
  useAgent,
  useComponent,
  useCopilotChatConfiguration,
  useFrontendTool,
  useHumanInTheLoop,
  useDefaultRenderTool,
} from "@copilotkit/react-core/v2";
import { Issue } from "@/components/pm-board/types";

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
  // Bind to the same per-thread agent clone the chat is using. Without
  // agentId from config, useAgent() would resolve to a different default
  // clone and applyPlanningChanges would mutate state the board never sees.
  const config = useCopilotChatConfiguration();
  const { agent } = useAgent({ agentId: config?.agentId });

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

  // applyPlanningChanges: silent partial-update tool used at the end of the
  // sprint-planning narration. The fixture emits one of these with the diff
  // derived from the handwritten notes (e.g. ISS-101 -> Done, ISS-113 ->
  // Todo); the handler reads current state, merges the partial changes by id,
  // and pushes the new list back via agent.setState. No render — the visible
  // effect is the board re-rendering with the moved cards. We don't go
  // through manage_issues here because (a) it would force the fixture to
  // carry the entire 20-issue list and (b) we want this to be a frontend
  // mutation so the demo plays even if the agent itself is mocked out.
  useFrontendTool(
    {
      name: "applyPlanningChanges",
      description:
        "Apply a list of partial issue updates to the board (status / priority / assignee per id). The frontend merges the diff into agent state. Use after narrating the sprint-planning workflow with agentProgress.",
      parameters: z.object({
        changes: z
          .array(
            z.object({
              id: z.string(),
              status: z
                .enum([
                  "Backlog",
                  "Todo",
                  "In Progress",
                  "In Review",
                  "Done",
                ])
                .optional(),
              priority: z
                .enum(["Urgent", "High", "Med", "Low"])
                .optional(),
              assignee: z.string().nullable().optional(),
            }),
          )
          .describe("Partial updates keyed by issue id."),
      }),
      handler: async ({ changes }) => {
        const current =
          (agent.state?.issues as Issue[] | undefined) ?? [];
        const byId = new Map(
          (changes as Array<Partial<Issue> & { id: string }>).map((c) => [
            c.id,
            c,
          ]),
        );
        const updated = current.map((issue) => {
          const change = byId.get(issue.id);
          return change ? { ...issue, ...change } : issue;
        });
        agent.setState({ issues: updated });
      },
    },
    [agent],
  );
};
