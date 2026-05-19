/**
 * Dashboard filter + focus state. Lives in agent.state.dashboard and is
 * controlled by the Dashboard Designer (ADK) agent via the updateDashboard
 * frontend tool.
 *
 * Keep in sync with apps/agent-adk/src/tools.py — the ADK agent's
 * updateDashboard tool serializes the same shape.
 */

import type { IssuePriority, IssueStatus } from "@/components/pm-board/types";

export interface DashboardFilter {
  assignee?: string | null;
  priority?: IssuePriority | null;
  status?: IssueStatus | null;
  labels?: string[] | null;
}

export type DashboardLayout = "overview" | "by_assignee" | "by_priority";

/**
 * Special render modes for the dashboard pane. `stats` (default) is the
 * aggregate dashboard. `personProfile` is the hardcoded "Sarah's workload"
 * demo response — a profile-style page focused on a single assignee with
 * quick stats, an AI insight card, and the person's tickets, all entering
 * with a stagger animation.
 */
export type DashboardMode = "stats" | "personProfile";

export interface DashboardState {
  filter?: DashboardFilter;
  /** Short human-readable description shown in the dashboard header. */
  focus?: string;
  /** Which layout the dashboard is currently emphasizing. */
  layout?: DashboardLayout;
  /** Optional render mode override. Defaults to "stats". */
  mode?: DashboardMode;
  /** When mode === "personProfile", which assignee to focus on. */
  person?: string;
  /** Optional AI insight blurb shown on the person profile. */
  insight?: string;
}
