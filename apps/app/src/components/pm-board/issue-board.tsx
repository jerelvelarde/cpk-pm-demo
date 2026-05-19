"use client";

import { useMemo } from "react";
import { IssueColumn } from "./issue-column";
import { Issue, IssueStatus, ISSUE_STATUSES } from "./types";

interface IssueBoardProps {
  issues: Issue[];
  onUpdate: (issues: Issue[]) => void;
  isAgentRunning: boolean;
}

export function IssueBoard({
  issues,
  onUpdate,
  isAgentRunning,
}: IssueBoardProps) {
  const byStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      Backlog: [],
      Todo: [],
      "In Progress": [],
      "In Review": [],
      Done: [],
    };
    for (const issue of issues) {
      const s = (ISSUE_STATUSES.includes(issue.status as IssueStatus)
        ? issue.status
        : "Backlog") as IssueStatus;
      grouped[s].push(issue);
    }
    return grouped;
  }, [issues]);

  const updateIssue = (id: string, changes: Partial<Issue>) => {
    onUpdate(issues.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteIssue = (id: string) => {
    onUpdate(issues.filter((i) => i.id !== id));
  };

  const addIssue = (status: IssueStatus) => {
    const newIssue: Issue = {
      id: `ISS-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: "New issue",
      description: "",
      status,
      priority: "Med",
      assignee: null,
      labels: [],
    };
    onUpdate([...issues, newIssue]);
  };

  const dropIssue = (id: string, status: IssueStatus) => {
    onUpdate(
      issues.map((i) => (i.id === id ? { ...i, status } : i)),
    );
  };

  return (
    <div
      className="h-full overflow-x-auto overflow-y-hidden p-6"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className="flex gap-3 h-full min-w-max">
        {ISSUE_STATUSES.map((status) => (
          <IssueColumn
            key={status}
            status={status}
            issues={byStatus[status]}
            onUpdateIssue={updateIssue}
            onDeleteIssue={deleteIssue}
            onAddIssue={addIssue}
            onDropIssue={dropIssue}
            isAgentRunning={isAgentRunning}
          />
        ))}
      </div>
    </div>
  );
}
