import { serve } from "@hono/node-server";
import {
  CopilotRuntime,
  CopilotKitIntelligence,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { WhisperTranscriptionService } from "./whisper-transcription.js";

const useMock = process.env.USE_MOCK === "1";

// In mock mode we point at the local aimock server instead of api.openai.com.
// Both the Python agent and the BFF honor this env (see apps/agent/main.py
// for the mirror). Defaults pulled from the aimock config in fixtures/.
if (useMock) {
  process.env.OPENAI_BASE_URL =
    process.env.OPENAI_BASE_URL ?? "http://localhost:4010/v1";
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "mock";
  console.log("[bff] USE_MOCK=1 — routing OpenAI to", process.env.OPENAI_BASE_URL);
}

const intelligence = new CopilotKitIntelligence({
  apiKey:
    process.env.INTELLIGENCE_API_KEY ?? "cpk_sPRVSEED_seed0privat0longtoken00",
  apiUrl: process.env.INTELLIGENCE_API_URL ?? "http://localhost:4201",
  wsUrl: process.env.INTELLIGENCE_GATEWAY_WS_URL ?? "ws://localhost:4401",
});

const langgraphAgent = new LangGraphAgent({
  deploymentUrl:
    process.env.LANGGRAPH_DEPLOYMENT_URL ?? "http://localhost:8123",
  graphId: "sample_agent",
  langsmithApiKey: process.env.LANGSMITH_API_KEY ?? "",
});

const transcriptionService = new WhisperTranscriptionService({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const app = createCopilotHonoHandler({
  basePath: "/api/copilotkit",
  runtime: new CopilotRuntime({
    intelligence,
    identifyUser: () => ({ id: "jordan-beamson", name: "Jordan Beamson" }),
    licenseToken: process.env.COPILOTKIT_LICENSE_TOKEN,
    agents: { default: langgraphAgent },
    openGenerativeUI: true,
    transcriptionService,
    a2ui: {
      injectA2UITool: false,
    },
    mcpApps: {
      servers: [
        {
          type: "http",
          url: process.env.MCP_SERVER_URL || "https://mcp.excalidraw.com",
          serverId: "example_mcp_app",
        },
      ],
    },
  }),
});

const port = Number(process.env.PORT) || 4000;

serve({ fetch: app.fetch, port }, () => {
  console.log(`BFF ready at http://localhost:${port}`);
});
