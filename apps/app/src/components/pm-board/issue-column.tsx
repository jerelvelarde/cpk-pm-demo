"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { IssueCard } from "./issue-card";
import { SectionTitle } from "./section-title";
import { Issue, IssueStatus } from "./types";

interface IssueColumnProps {
  status: IssueStatus;
  issues: Issue[];
  onUpdateIssue: (id: string, changes: Partial<Issue>) => void;
  onDeleteIssue: (id: string) => void;
  onAddIssue: (status: IssueStatus) => void;
  onDropIssue: (id: string, status: IssueStatus) => void;
  isAgentRunning: boolean;
}

export function IssueColumn({
  status,
  issues,
  onUpdateIssue,
  onDeleteIssue,
  onAddIssue,
  onDropIssue,
  isAgentRunning,
}: IssueColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <section
      aria-label={`${status} column`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const id = e.dataTransfer.getData("text/issue-id");
        if (id) onDropIssue(id, status);
      }}
      className="flex flex-col min-w-[260px] w-[260px] flex-none"
      style={{ position: "relative", zIndex: 1 }}
    >
      <SectionTitle
        title={`${status} · ${issues.length}`}
        trailing={
          <button
            onClick={() => onAddIssue(status)}
            disabled={isAgentRunning}
            aria-label={`Add issue to ${status}`}
            className="h-5 w-5 inline-flex items-center justify-center rounded text-[#57575b] hover:bg-white/60 cursor-pointer disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
          </button>
        }
      />

      <div
        className="flex-1 flex flex-col gap-2 p-2 rounded-lg transition-colors"
        style={{
          background: dragOver
            ? "rgba(255,255,255,0.65)"
            : "rgba(255,255,255,0.30)",
          border: dragOver
            ? "2px dashed #bec2ff"
            : "2px dashed transparent",
          minHeight: 120,
        }}
      >
        {issues.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-[11px] text-[#838389] italic">
            Empty
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/issue-id", issue.id);
                e.dataTransfer.effectAllowed = "move";
              }}
            >
              <IssueCard
                issue={issue}
                onUpdate={(changes) => onUpdateIssue(issue.id, changes)}
                onDelete={() => onDeleteIssue(issue.id)}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
