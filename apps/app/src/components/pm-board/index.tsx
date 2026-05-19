"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { IssueBoard } from "./issue-board";
import { Issue } from "./types";
import { AnalysisTimeline } from "./analysis-timeline";

export function PmBoard() {
  const { agent } = useAgent();
  const issues = (agent.state?.issues as Issue[] | undefined) ?? [];

  return (
    <div className="h-full" style={{ position: "relative" }}>
      <IssueBoard
        issues={issues}
        onUpdate={(updated) => agent.setState({ issues: updated })}
        isAgentRunning={agent.isRunning}
      />
      <AnalysisTimeline />
    </div>
  );
}

export { type Issue } from "./types";
