"""
Backlog analysis tool.

Emits step-by-step progress via copilotkit_emit_state so the frontend can
render a "thinking" timeline. See phase 5 for full implementation; this stub
is the minimum surface the agent needs to compile.
"""

from typing import Any
from langchain.tools import ToolRuntime, tool

try:
    # copilotkit SDK ships a helper for streaming partial state to the client.
    from copilotkit.langgraph import copilotkit_emit_state  # type: ignore
except ImportError:  # pragma: no cover - fallback if the helper moves
    async def copilotkit_emit_state(*_args: Any, **_kwargs: Any) -> None:  # type: ignore
        return None


@tool
async def analyze_backlog(focus: str, runtime: ToolRuntime) -> str:
    """
    Deeply analyze the current backlog. `focus` is a short string describing
    what the user wants ("what should we cut?", "what's blocking ship?",
    "prioritize for next sprint").

    Streams step-by-step progress to the frontend via shared state.
    """
    issues = runtime.state.get("issues", []) if runtime.state else []

    # Emit progress steps. The frontend timeline subscribes to
    # agent.state.analysis and animates step transitions.
    await copilotkit_emit_state(
        runtime.config,
        {"analysis": {"step": "reading", "count": len(issues), "focus": focus}},
    )

    # Categorize by status
    by_status: dict[str, int] = {}
    for issue in issues:
        s = issue.get("status", "Backlog")
        by_status[s] = by_status.get(s, 0) + 1
    await copilotkit_emit_state(
        runtime.config,
        {"analysis": {"step": "categorizing", "by_status": by_status}},
    )

    # Count high-priority unblockers
    urgent = [i for i in issues if i.get("priority") == "Urgent"]
    high = [i for i in issues if i.get("priority") == "High"]
    await copilotkit_emit_state(
        runtime.config,
        {
            "analysis": {
                "step": "drafting_plan",
                "urgent_count": len(urgent),
                "high_count": len(high),
            }
        },
    )

    # Build a tiny summary
    summary_lines = []
    if urgent:
        summary_lines.append(
            f"{len(urgent)} urgent: " + ", ".join(i["id"] for i in urgent[:5])
        )
    if high:
        summary_lines.append(
            f"{len(high)} high: " + ", ".join(i["id"] for i in high[:5])
        )
    summary_lines.append(
        f"Distribution: " + ", ".join(f"{k}={v}" for k, v in by_status.items())
    )
    plan = "\n".join(summary_lines)

    await copilotkit_emit_state(
        runtime.config,
        {"analysis": {"step": "done", "plan": plan}},
    )

    return plan
