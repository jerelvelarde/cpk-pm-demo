"use client";

import { useMemo } from "react";
import {
  useAgent,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import {
  ASSIGNEE_COLORS,
  Issue,
  IssuePriority,
  IssueStatus,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  PRIORITY_COLORS,
} from "@/components/pm-board/types";
import type { DashboardFilter, DashboardState } from "./types";
import { AlertTriangle, Layers, RotateCcw, User, Users } from "lucide-react";

const STATUS_COLOR: Record<IssueStatus, string> = {
  Backlog: "#838389",
  Todo: "#bec2ff",
  "In Progress": "#85ecce",
  "In Review": "#ffac4d",
  Done: "#189370",
};

/**
 * Dashboard Designer view — the ADK agent's "app pane". Reads the same
 * agent.state.issues the kanban board reads, then aggregates into stats +
 * charts. Filters and "focus" copy come from agent.state.dashboard, which
 * the agent controls via the updateDashboard frontend tool — so a user
 * question like "Show me Sarah's high-priority work" causes the agent to
 * call updateDashboard({filter:{assignee:"Sarah",priority:"High"}}), and
 * every aggregate on this surface re-derives from the filtered set.
 */
export function Dashboard() {
  const config = useCopilotChatConfiguration();
  const { agent } = useAgent({ agentId: config?.agentId });
  const issues = (agent.state?.issues as Issue[] | undefined) ?? [];
  const dashboard = (agent.state?.dashboard as DashboardState | undefined) ?? {};
  const filter = dashboard.filter ?? {};

  const filtered = useMemo(
    () => applyFilter(issues, filter),
    [issues, filter],
  );

  const stats = useMemo(() => deriveStats(filtered), [filtered]);
  const byStatus = useMemo(() => groupBy(filtered, "status"), [filtered]);
  const byPriority = useMemo(() => groupBy(filtered, "priority"), [filtered]);
  const byAssignee = useMemo(() => groupAssignees(filtered), [filtered]);

  const hasIssues = issues.length > 0;
  const hasFilter =
    !!filter.assignee || !!filter.priority || !!filter.status ||
    (Array.isArray(filter.labels) && filter.labels.length > 0);

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        padding: 20,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <DashboardHeader
        total={issues.length}
        filteredCount={filtered.length}
        focus={dashboard.focus}
        filter={filter}
        onReset={() => agent.setState({ dashboard: {} })}
        hasIssues={hasIssues}
      />

      {!hasIssues ? (
        <EmptyState />
      ) : (
        <>
          <StatsRow stats={stats} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <ChartCard
              title="By status"
              subtitle={hasFilter ? "Within current filter" : "Full backlog"}
            >
              <Donut data={byStatus} colorFor={(k) => STATUS_COLOR[k as IssueStatus]} />
            </ChartCard>

            <ChartCard
              title="By priority"
              subtitle={
                hasFilter
                  ? "Within current filter"
                  : "Urgent first — unblockers"
              }
            >
              <PriorityBars data={byPriority} />
            </ChartCard>
          </div>

          <ChartCard
            title="By assignee"
            subtitle="Open work per person"
          >
            <AssigneeBars data={byAssignee} />
          </ChartCard>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------------- header

function DashboardHeader({
  total,
  filteredCount,
  focus,
  filter,
  onReset,
  hasIssues,
}: {
  total: number;
  filteredCount: number;
  focus?: string;
  filter: DashboardFilter;
  onReset: () => void;
  hasIssues: boolean;
}) {
  const chips: { label: string; tone: string }[] = [];
  if (filter.assignee) chips.push({ label: filter.assignee, tone: "#010507" });
  if (filter.priority)
    chips.push({
      label: filter.priority,
      tone: PRIORITY_COLORS[filter.priority as IssuePriority],
    });
  if (filter.status)
    chips.push({
      label: filter.status,
      tone: STATUS_COLOR[filter.status as IssueStatus],
    });
  for (const l of filter.labels ?? []) chips.push({ label: l, tone: "#57575b" });

  const showResetButton = chips.length > 0;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        border: "2px solid #ffffff",
        borderRadius: 8,
        padding: "12px 16px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 300,
              color: "#010507",
              letterSpacing: "-0.01em",
            }}
          >
            Dashboard
          </h2>
          {hasIssues && (
            <span style={{ fontSize: 12, color: "#57575b" }}>
              {filteredCount === total
                ? `${total} issues`
                : `${filteredCount} of ${total} issues`}
            </span>
          )}
        </div>
        {showResetButton && (
          <button
            onClick={onReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              background: "#ffffff",
              border: "1px solid #dbdbe5",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              color: "#57575b",
              cursor: "pointer",
            }}
          >
            <RotateCcw style={{ width: 12, height: 12 }} />
            Reset
          </button>
        )}
      </div>
      {focus ? (
        <div
          style={{
            fontSize: 12,
            color: "#010507",
            lineHeight: 1.4,
          }}
        >
          {focus}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#838389", lineHeight: 1.4 }}>
          Ask the agent to break down the backlog by anything &mdash; priority,
          assignee, status, labels.
        </div>
      )}
      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
          {chips.map((c) => (
            <span
              key={c.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                background: "rgba(255,255,255,0.65)",
                borderRadius: 999,
                border: `1px solid ${c.tone}33`,
                fontSize: 10,
                fontWeight: 500,
                color: c.tone,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: c.tone,
                }}
              />
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- stats row

function StatsRow({
  stats,
}: {
  stats: {
    total: number;
    inProgress: number;
    urgent: number;
    unassigned: number;
  };
}) {
  const items = [
    {
      label: "Total",
      value: stats.total,
      Icon: Layers,
      tone: "#010507",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      Icon: Users,
      tone: "#189370",
    },
    {
      label: "Urgent",
      value: stats.urgent,
      Icon: AlertTriangle,
      tone: "#fa5f67",
    },
    {
      label: "Unassigned",
      value: stats.unassigned,
      Icon: User,
      tone: "#57575b",
    },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
    >
      {items.map(({ label, value, Icon, tone }) => (
        <div
          key={label}
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            border: "2px solid #ffffff",
            borderRadius: 8,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              fontWeight: 500,
              color: "#57575b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <Icon style={{ width: 12, height: 12, color: tone }} />
            {label}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 300,
              color: "#010507",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ charts

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        border: "2px solid #ffffff",
        borderRadius: 8,
        padding: 14,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#57575b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "#838389", marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Donut({
  data,
  colorFor,
}: {
  data: { key: string; value: number }[];
  colorFor: (key: string) => string;
}) {
  const size = 180;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);

  let acc = 0;
  const arcs = data.map((d) => {
    const ratio = total > 0 ? d.value / total : 0;
    const arc = ratio * circumference;
    const offset = -acc;
    acc += arc;
    return { ...d, arc, gap: circumference - arc, offset };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ flexShrink: 0 }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(219, 219, 229, 0.55)"
          strokeWidth={stroke}
        />
        {total > 0 &&
          arcs.map((a) => (
            <circle
              key={a.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorFor(a.key)}
              strokeWidth={stroke}
              strokeDasharray={`${a.arc} ${a.gap}`}
              strokeDashoffset={a.offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 320ms ease-out" }}
            />
          ))}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight={300}
          fill="#010507"
        >
          {total}
        </text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d) => (
          <div
            key={d.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: colorFor(d.key),
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, color: "#010507" }}>{d.key}</span>
            <span
              style={{
                color: "#57575b",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityBars({ data }: { data: { key: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d) => {
        const color = PRIORITY_COLORS[d.key as IssuePriority] ?? "#838389";
        const w = (d.value / max) * 100;
        return (
          <div
            key={d.key}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                width: 56,
                fontSize: 11,
                fontWeight: 500,
                color: "#010507",
              }}
            >
              {d.key}
            </span>
            <div
              style={{
                flex: 1,
                height: 18,
                background: "rgba(219, 219, 229, 0.45)",
                borderRadius: 999,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${w}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 999,
                  transition: "width 320ms ease-out",
                }}
              />
            </div>
            <span
              style={{
                width: 24,
                fontSize: 11,
                color: "#57575b",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {d.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AssigneeBars({ data }: { data: { key: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((d) => {
        const color = ASSIGNEE_COLORS[d.key] ?? "#dbdbe5";
        const w = (d.value / max) * 100;
        const isUnassigned = d.key === "Unassigned";
        return (
          <div
            key={d.key}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                width: 120,
                fontSize: 12,
                color: "#010507",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: isUnassigned ? "transparent" : color,
                  border: isUnassigned ? "1px dashed #838389" : "0",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#010507",
                }}
              >
                {isUnassigned ? "?" : d.key.slice(0, 1)}
              </span>
              {d.key}
            </div>
            <div
              style={{
                flex: 1,
                height: 14,
                background: "rgba(219, 219, 229, 0.45)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${w}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 999,
                  transition: "width 320ms ease-out",
                }}
              />
            </div>
            <span
              style={{
                width: 24,
                fontSize: 11,
                color: "#57575b",
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {d.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------- empty state

function EmptyState() {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        border: "2px solid #ffffff",
        borderRadius: 8,
        padding: 32,
        textAlign: "center",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "#838389",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}
      >
        No data yet
      </div>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 300, color: "#010507" }}>
        Waiting for the agent
      </h3>
      <p
        style={{
          margin: "6px auto 0",
          maxWidth: 320,
          fontSize: 13,
          color: "#57575b",
          lineHeight: 1.45,
        }}
      >
        Ask the agent to load the backlog or run an analysis, and the dashboard
        will populate.
      </p>
    </div>
  );
}

// ---------------------------------------------------------- pure helpers

function applyFilter(issues: Issue[], filter: DashboardFilter): Issue[] {
  if (!filter || Object.keys(filter).length === 0) return issues;
  return issues.filter((i) => {
    if (filter.assignee && i.assignee !== filter.assignee) return false;
    if (filter.priority && i.priority !== filter.priority) return false;
    if (filter.status && i.status !== filter.status) return false;
    if (filter.labels && filter.labels.length > 0) {
      const have = new Set(i.labels ?? []);
      for (const l of filter.labels) if (!have.has(l)) return false;
    }
    return true;
  });
}

function deriveStats(issues: Issue[]) {
  return {
    total: issues.length,
    inProgress: issues.filter((i) => i.status === "In Progress").length,
    urgent: issues.filter((i) => i.priority === "Urgent").length,
    unassigned: issues.filter((i) => !i.assignee).length,
  };
}

function groupBy<K extends "status" | "priority">(
  issues: Issue[],
  key: K,
): { key: string; value: number }[] {
  const order = key === "status" ? ISSUE_STATUSES : ISSUE_PRIORITIES;
  const counts = new Map<string, number>();
  for (const o of order) counts.set(o, 0);
  for (const i of issues) {
    const k = i[key] as string;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].map(([k, v]) => ({ key: k, value: v }));
}

function groupAssignees(issues: Issue[]): { key: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const i of issues) {
    const k = i.assignee ?? "Unassigned";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ key: k, value: v }));
}
