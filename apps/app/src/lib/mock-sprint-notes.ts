/**
 * Mock "Sprint Cycle 52 Meeting Notes" attachment for the "Plan next sprint"
 * suggestion chip.
 *
 * When the chip is clicked we synthesize a multimodal user message with the
 * text the user "would have typed" plus a `document` content part carrying the
 * notes as base64 text/plain. CopilotKit's <CopilotChatAttachmentRenderer>
 * picks up the document part and renders a file chip above the user's message
 * bubble — same UI affordance as if they had actually dragged the file into
 * the input. The notes text also flows into the LLM context so the agent (or
 * its aimock fixture) can act on it.
 *
 * See: apps/agent/main.py — agent instructions; fixtures/sprint-planning.json
 * — the canned response under USE_MOCK=1.
 */

import type { Attachment } from "@copilotkit/shared";

export const SPRINT_NOTES_FILENAME = "Sprint Cycle 52 Meeting Notes.txt";

export const SPRINT_NOTES_TEXT = `SPRINT CYCLE 52 — PLANNING NOTES
================================
Date: 2026-05-12
Attendees: Alex (Eng), Sarah (PM), Jordan (Infra), Priya (Design), Maya (QA)

CONTEXT
-------
Last cycle (51) shipped the 40% p95 latency reduction. Carryover risk is
concentrated in payments + Slack integrations. Customer-facing reliability is
the #1 theme this cycle.

DECISIONS
---------
1. Pull ISS-107 (Postgres pool exhaustion) into Todo — Jordan to size the
   read-replica approach by EOD Tuesday.
2. ISS-101 stays In Progress; Alex unblocks the Safari iframe CORS preflight
   by Friday.
3. ISS-118 (Slack notification dedupe) moves to Urgent priority.

NEW WORK PROPOSED FOR CYCLE 52
------------------------------
- Retry-with-jitter wrapper for the Stripe webhook handler.
  Owner: Alex. Priority: High. Labels: payments, infra.
- Customer-status RSS feed for enterprise tier.
  Owner: Sarah. Priority: Med. Labels: enterprise, growth.
- Replace the in-memory rate limiter with a Redis token bucket.
  Owner: Jordan. Priority: High. Labels: infra, performance.
- Onboarding-flow accessibility audit (axe + manual pass).
  Owner: Priya. Priority: Med. Labels: a11y, onboarding.

NOT THIS CYCLE
--------------
- GDPR export endpoint (ISS-113) → deferred to cycle 53; legal still reviewing.
- Lodash removal (ISS-114) → keep In Progress, ship when Alex has slack.
`;

/**
 * Base64-encode the notes in a browser-safe way. We can't use Node's Buffer in
 * the client bundle, and btoa() chokes on multi-byte UTF-8, so we go through
 * TextEncoder → binary string → btoa().
 */
function base64EncodeUtf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Build the multimodal `content` array for a user message that includes the
 * mock sprint notes as a document attachment. Mirrors the shape
 * <CopilotChat>'s onSubmitInput produces when the user really attaches a
 * file: a [text, document] array where the document carries a base64 data
 * source + filename metadata.
 */
export function buildSprintNotesMessageContent(text: string): Array<
  | { type: "text"; text: string }
  | {
      type: "document";
      source: { type: "data"; value: string; mimeType: string };
      metadata: { filename: string };
    }
> {
  return [
    { type: "text", text },
    {
      type: "document",
      source: {
        type: "data",
        value: base64EncodeUtf8(SPRINT_NOTES_TEXT),
        mimeType: "text/plain",
      },
      metadata: { filename: SPRINT_NOTES_FILENAME },
    },
  ];
}

/**
 * Convenience: build the same shape as a CopilotKit `Attachment` (e.g. for
 * future use with the attachment queue / `useAttachments`). Not used by the
 * current chip flow, kept here so the attachment can be reused from other
 * surfaces (file picker prefill, "load demo" button, etc.).
 */
export function buildSprintNotesAttachment(): Attachment {
  return {
    id: "mock-sprint-notes",
    type: "document",
    source: {
      type: "data",
      value: base64EncodeUtf8(SPRINT_NOTES_TEXT),
      mimeType: "text/plain",
    },
    filename: SPRINT_NOTES_FILENAME,
    size: SPRINT_NOTES_TEXT.length,
    status: "ready",
  };
}
