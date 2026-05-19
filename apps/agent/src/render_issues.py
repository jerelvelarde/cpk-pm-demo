"""
Render-list backend tool. The actual UI lives on the frontend (registered via
useComponent as `issueList`); this backend tool just lets the agent decide
when to surface the list.

CopilotKit's openGenerativeUI flow uses the backend tool's name + JSON args to
drive a matching frontend useComponent. We expose it under a separate name
(`render_issue_list`) and instruct the agent to use the `issueList` generative
UI component for the actual render.
"""

from langchain.tools import ToolRuntime, tool


@tool
def render_issue_list(issue_ids: list[str], caption: str = "", runtime: ToolRuntime = None) -> str:
    """
    Show a list of issues inline in chat as glass cards.

    Use this when the user asks to "show me" or "list" specific issues.
    Each card has a "View on board" button that scrolls to the matching
    column on the kanban.

    IMPORTANT: after calling this tool, immediately render the issueList
    component (it is registered as a frontend generative-ui component with
    name="issueList"). Pass issueIds: the list returned from this call.

    Args:
        issue_ids: The issue ids to show (e.g. ["ISS-101", "ISS-107"]).
        caption: Optional short caption above the list ("Urgent issues",
                 "Sprint candidates", etc.).
    """
    return (
        f"Surfacing {len(issue_ids)} issues inline. Now call the issueList "
        f"generative UI component with issueIds={issue_ids!r} and "
        f"caption={caption!r}."
    )
