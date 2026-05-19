"""
Google ADK PM-copilot agent, exposed via the ag-ui-adk bridge over FastAPI.

Same tool surface as apps/agent (LangGraph) — the frontend is agent-agnostic.
"""

import os

# Honor the deterministic-demo mode (same env contract as the langgraph agent
# and the BFF).
if os.environ.get("USE_MOCK") == "1":
    os.environ.setdefault("OPENAI_BASE_URL", "http://localhost:4010/v1")
    os.environ.setdefault("OPENAI_API_KEY", "mock")
    print(
        f"[agent-adk] USE_MOCK=1 — routing OpenAI to {os.environ['OPENAI_BASE_URL']}",
        flush=True,
    )

from fastapi import FastAPI

from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from google.adk.agents import Agent as ADKBaseAgent
from google.adk.models.lite_llm import LiteLlm

from src.tools import (
    analyze_backlog,
    get_issues,
    manage_issues,
    propose_issue_change,
)


SYSTEM_PROMPT = """
You are a project-management copilot. You help an engineering team triage,
plan, and ship work. The user can see a kanban with five columns
(Backlog / Todo / In Progress / In Review / Done). Issues have an id, title,
description, status, priority (Urgent/High/Med/Low), optional assignee,
labels, and due date.

Keep replies to 1-2 sentences unless asked for detail.

Tools:
- get_issues: read the board.
- manage_issues: bulk replace.
- propose_issue_change: single edit, asks user to approve. Always follow
  up with the proposeIssueMutation frontend tool.
- issueList (frontend tool): call directly with issueIds=[...] to surface
  a set of issues inline in chat as glass cards. Use whenever the user
  asks to show / list / see specific issues.
- attachMeetingNotes (frontend tool): call when the user shares planning
  notes inline. Pass filename, size, and the full content as a string —
  the frontend animates an "attached file" card so the user can see what
  document you're working from before you propose changes.
- analyze_backlog: open-ended analysis.
""".strip()


# We route ADK through LiteLLM so the same OPENAI_BASE_URL / OPENAI_API_KEY
# env that the LangGraph side honors also drives ADK. This means USE_MOCK=1
# replays aimock fixtures for both agents identically.
_model = LiteLlm(
    model=os.environ.get("ADK_MODEL", "openai/gpt-4.1"),
)

_inner_agent = ADKBaseAgent(
    name="pm_copilot_adk",
    model=_model,
    instruction=SYSTEM_PROMPT,
    tools=[
        get_issues,
        manage_issues,
        propose_issue_change,
        analyze_backlog,
    ],
)

adk_agent = ADKAgent(
    adk_agent=_inner_agent,
    app_name="pm_copilot",
    user_id="jordan-beamson",
    use_in_memory_services=True,
)

app = FastAPI(title="PM Copilot — ADK")
add_adk_fastapi_endpoint(app, adk_agent)


@app.get("/ok")
def ok() -> dict[str, str]:
    return {"status": "ok"}
