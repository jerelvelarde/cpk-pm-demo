"""
Trigger inline rendering of issue cards in chat.

The actual UI lives on the frontend (registered via useComponent as
`issueList`). This backend tool is just the call-site the agent hits to ask
the frontend to render — CopilotKit's tool-call protocol surfaces the args
to the registered React component.
"""

from langchain.tools import ToolRuntime, tool


@tool
def render_issue_list(issue_ids: list[str], runtime: ToolRuntime) -> str:
    """
    Render a list of issues inline in chat as glass cards. Each card has a
    "View on board" button that scrolls to the matching column on the kanban.

    `issue_ids` is the list of issue ids (e.g. ["ISS-101", "ISS-107"]) to
    surface. Use this when the user asks to see specific issues without
    leaving the chat.
    """
    return f"Rendering {len(issue_ids)} issue cards inline."
