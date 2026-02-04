/**
 * Standalone Gemini MCP Server
 *
 * Exposes `ask_gemini` tool via stdio transport for Claude Code's MCP system.
 * This is the external-process version that runs via .mcp.json configuration.
 *
 * Usage: node bridge/gemini-server.cjs
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { detectGeminiCli } from './cli-detection.js';
import { resolveSystemPrompt, buildPromptWithSystemContext } from './prompt-injection.js';

// Default model can be overridden via environment variable
const GEMINI_DEFAULT_MODEL = process.env.OMC_GEMINI_DEFAULT_MODEL || 'gemini-2.5-pro';
const GEMINI_TIMEOUT = parseInt(process.env.OMC_GEMINI_TIMEOUT || '120000', 10);

// Model fallback chain: try each in order if previous fails
const GEMINI_MODEL_FALLBACKS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

// Gemini is best for design review and implementation tasks (leverages 1M context)
const GEMINI_VALID_ROLES = ['designer', 'executor'] as const;
type GeminiAgentRole = typeof GEMINI_VALID_ROLES[number];

/**
 * Execute Gemini CLI command and return the response
 */
function executeGemini(prompt: string, model?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ['--yolo'];
    if (model) {
      args.push('--model', model);
    }
    const child = spawn('gemini', args, {
      timeout: GEMINI_TIMEOUT,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 || stdout.trim()) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Gemini exited with code ${code}: ${stderr || 'No output'}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn Gemini CLI: ${err.message}`));
    });

    // Pipe prompt via stdin to avoid OS argument length limits
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// Tool definition
const askGeminiTool = {
  name: 'ask_gemini',
  description: `Send a prompt to Google Gemini CLI for design review or implementation validation. Gemini excels at analyzing large codebases with its 1M token context window. Requires agent_role to specify the perspective (designer or executor). Requires Gemini CLI (npm install -g @google/gemini-cli).`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      prompt: { type: 'string', description: 'The prompt to send to Gemini' },
      agent_role: {
        type: 'string',
        enum: GEMINI_VALID_ROLES,
        description: `Required. Agent perspective for Gemini: ${GEMINI_VALID_ROLES.join(', ')}. Gemini is optimized for design review and implementation tasks.`
      },
      model: { type: 'string', description: `Gemini model to use (default: ${GEMINI_DEFAULT_MODEL}). Automatic fallback chain: ${GEMINI_MODEL_FALLBACKS.join(' → ')}` },
      files: { type: 'array', items: { type: 'string' }, description: 'File paths for Gemini to analyze (leverages 1M token context window)' },
    },
    required: ['prompt', 'agent_role'],
  },
};

// Create the MCP server
const server = new Server(
  {
    name: 'g',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [askGeminiTool],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== 'ask_gemini') {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const { prompt, agent_role, model = GEMINI_DEFAULT_MODEL, files } = (args ?? {}) as {
    prompt: string;
    agent_role: GeminiAgentRole;
    model?: string;
    files?: string[];
  };

  // Validate agent_role
  if (!agent_role || !GEMINI_VALID_ROLES.includes(agent_role as GeminiAgentRole)) {
    return {
      content: [{ type: 'text', text: `Invalid agent_role: "${agent_role}". Gemini requires one of: ${GEMINI_VALID_ROLES.join(', ')}` }],
      isError: true,
    };
  }

  // Check CLI availability
  const detection = detectGeminiCli();
  if (!detection.available) {
    return {
      content: [{ type: 'text', text: `Gemini CLI is not available: ${detection.error}\n\n${detection.installHint}` }],
      isError: true,
    };
  }

  // Resolve system prompt from agent role
  const resolvedSystemPrompt = resolveSystemPrompt(undefined, agent_role);

  // Build file context
  let fileContext: string | undefined;
  if (files && files.length > 0) {
    fileContext = files.map(f => {
      try {
        return `--- File: ${f} ---\n${readFileSync(f, 'utf-8')}`;
      } catch (err) {
        return `--- File: ${f} --- (Error reading: ${(err as Error).message})`;
      }
    }).join('\n\n');
  }

  // Combine: system prompt > file context > user prompt
  const fullPrompt = buildPromptWithSystemContext(prompt, fileContext, resolvedSystemPrompt);

  // Build fallback chain: start from the requested model
  const requestedModel = model;
  const fallbackIndex = GEMINI_MODEL_FALLBACKS.indexOf(requestedModel);
  const modelsToTry = fallbackIndex >= 0
    ? GEMINI_MODEL_FALLBACKS.slice(fallbackIndex)
    : [requestedModel, ...GEMINI_MODEL_FALLBACKS];

  const errors: string[] = [];
  for (const tryModel of modelsToTry) {
    try {
      const response = await executeGemini(fullPrompt, tryModel);
      const usedFallback = tryModel !== requestedModel;
      const prefix = usedFallback ? `[Fallback: used ${tryModel} instead of ${requestedModel}]\n\n` : '';
      return {
        content: [{ type: 'text', text: `${prefix}${response}` }],
        isError: false,
      };
    } catch (err) {
      errors.push(`${tryModel}: ${(err as Error).message}`);
    }
  }

  return {
    content: [{ type: 'text', text: `Gemini CLI error: all models failed.\n${errors.join('\n')}` }],
    isError: true,
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gemini MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start Gemini server:', error);
  process.exit(1);
});
