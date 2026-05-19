"use client";

import { z } from "zod";
import { ExternalLink } from "lucide-react";
import {
  useAgent,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import {
  ASSIGNEE_COLORS,
  Issue,
  IssuePriority,
  PRIORITY_COLORS,
  assigneeInitials,
} from "@/components/pm-board/types";
import { requestFocusIssue } from "@/components/pm-board/board-events";

/**
 * Render a list of issues inline in chat as a compact glass table. Mirrors
 * <IssueList /> but tabular — ID / Title / Status / Priority / Assignee / Due
 * with a small "View on board" affordance per row. The agent passes either:
 *   - a list of issue ids → we look up the full record in agent.state.issues
 *   - inline issue objects → we render them directly
 */
export const IssueTableProps = z.object({
  issueIds: z
    .array(z.string())
    .optional()
    .describe(
      "Issue ids to look up in agent state. Prefer this over passing full issue objects.",
    ),
  issues: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        status: z.enum([
          "Backlog",
          "Todo",
          "In Progress",
          "In Review",
          "Done",
        ]),
        priority: z.enum(["Urgent", "High", "Med", "Low"]),
        assignee: z.string().optional(),
        labels: z.array(z.string()).optional(),
        dueDate: z.string().optional(),
      }),
    )
    .optional(),
  caption: z
    .string()
    .optional()
    .describe("Optional short caption shown above the table."),
});

export type IssueTableArgs = z.infer<typeof IssueTableProps>;

export function IssueTable({ issueIds, issues, caption }: IssueTableArgs) {
  const config = useCopilotChatConfiguration();
  const { agent } = useAgent({ agentId: config?.agentId });
  const stateIssues = (agent.state?.issues as Issue[] | undefined) ?? [];

  let resolved: Issue[] = [];
  if (issues && issues.length > 0) {
    resolved = issues.map((i) => ({
      ...i,
      labels: i.labels ?? [],
      assignee: i.assignee ?? null,
      dueDate: i.dueDate ?? null,
      description: i.description ?? "",
    })) as Issue[];
  } else if (issueIds && issueIds.length > 0) {
    resolved = issueIds
      .map((id) => stateIssues.find((i) => i.id === id))
      .filter((i): i is Issue => Boolean(i));
  }

  if (resolved.length === 0) {
    return (
      <div
        style={{
          fontSize: 12,
          color: "#838389",
          fontStyle: "italic",
        }}
      >
        No issues to show.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 my-2">
      {caption && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 400,
            color: "#57575b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            paddingLeft: 4,
          }}
        >
          {caption}
        </div>
      )}
      <div
        className="w-full overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          border: "2px solid #ffffff",
          borderRadius: 8,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: "0px 1px 3px 0px rgba(1, 5, 7, 0.08)",
        }}
      >
        <table
          className="w-full border-collapse"
          style={{ fontSize: 12, color: "#010507" }}
        >
          <thead>
            <tr
              style={{
                background: "rgba(255,255,255,0.55)",
                borderBottom: "1px solid #dbdbe5",
              }}
            >
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Assignee</Th>
              <Th>Due</Th>
              <Th aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {resolved.map((issue, idx) => {
              const priorityColor =
                PRIORITY_COLORS[issue.priority as IssuePriority];
              const assigneeColor =
                (issue.assignee && ASSIGNEE_COLORS[issue.assignee]) ?? "#dbdbe5";
              return (
                <tr
                  key={issue.id}
                  style={{
                    borderTop:
                      idx === 0 ? "none" : "1px solid rgba(219,219,229,0.6)",
                  }}
                >
                  <Td>
                    <span
                      style={{
                        fontFamily:
                          "Spline Sans Mono, ui-monospace, monospace",
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#838389",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {issue.id}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontWeight: 600 }}>{issue.title}</span>
                  </Td>
                  <Td>
                    <span
                      className="rounded-full px-1.5 py-[1px] text-[10px] font-medium"
                      style={{
                        background: "rgba(255,255,255,0.65)",
                        color: "#010507",
                      }}
                    >
                      {issue.status}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-[1px]"
                      style={{
                        background: "rgba(255,255,255,0.65)",
                        border: `1px solid ${priorityColor}40`,
                        fontSize: 10,
                        fontWeight: 500,
                        color: priorityColor,
                      }}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: priorityColor }}
                      />
                      {issue.priority}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <div
                        title={issue.assignee ?? "Unassigned"}
                        className="h-5 w-5 rounded-full flex items-center justify-center"
                        style={{
                          background: assigneeColor,
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#010507",
                        }}
                      >
                        {assigneeInitials(issue.assignee)}
                      </div>
                      <span style={{ fontSize: 11, color: "#57575b" }}>
                        {issue.assignee ?? "Unassigned"}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    {issue.dueDate ? (
                      <span
                        className="tabular-nums"
                        style={{ fontSize: 11, color: "#838389" }}
                      >
                        {formatDueDate(issue.dueDate)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "#bdbdc4" }}>—</span>
                    )}
                  </Td>
                  <Td>
                    <button
                      onClick={() => requestFocusIssue(issue.id)}
                      className="inline-flex items-center gap-1 cursor-pointer"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #dbdbe5",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#010507",
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      style={{
        textAlign: "left",
        padding: "8px 10px",
        fontSize: 10,
        fontWeight: 500,
        color: "#57575b",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "8px 10px", verticalAlign: "middle" }}>{children}</td>
  );
}

function formatDueDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
