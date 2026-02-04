/**
 * Standalone Codex MCP Server
 *
 * Exposes `ask_codex` tool via stdio transport for Claude Code's MCP system.
 * This is the external-process version that runs via .mcp.json configuration.
 *
 * Usage: node bridge/codex-server.cjs
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { detectCodexCli } from './cli-detection.js';
import { resolveSystemPrompt, buildPromptWithSystemContext } from './prompt-injection.js';

// Default model can be overridden via environment variable
const CODEX_DEFAULT_MODEL = process.env.OMC_CODEX_DEFAULT_MODEL || 'gpt-4.1';
const CODEX_TIMEOUT = parseInt(process.env.OMC_CODEX_TIMEOUT || '60000', 10);

// Codex is best for analytical/planning tasks
const CODEX_VALID_ROLES = ['architect', 'planner', 'critic'] as const;
type CodexAgentRole = typeof CODEX_VALID_ROLES[number];

/**
 * Parse Codex JSONL output to extract the final text response
 */
function parseCodexOutput(output: string): string {
  const lines = output.trim().split('\n').filter(l => l.trim());
  const messages: string[] = [];

  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      // Look for message events with text content
      if (event.type === 'message' && event.content) {
        if (typeof event.content === 'string') {
          messages.push(event.content);
        } else if (Array.isArray(event.content)) {
          for (const part of event.content) {
            if (part.type === 'text' && part.text) {
              messages.push(part.text);
            }
          }
        }
      }
      // Also handle output_text events
      if (event.type === 'output_text' && event.text) {
        messages.push(event.text);
      }
    } catch {
      // Skip non-JSON lines (progress indicators, etc.)
    }
  }

  return messages.join('\n') || output; // Fallback to raw output
}

/**
 * Execute Codex CLI command and return the response
 */
function executeCodex(prompt: string, model: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ['exec', '-m', model, '--json', '--full-auto'];
    const child = spawn('codex', args, {
      timeout: CODEX_TIMEOUT,
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
        resolve(parseCodexOutput(stdout));
      } else {
        reject(new Error(`Codex exited with code ${code}: ${stderr || 'No output'}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn Codex CLI: ${err.message}`));
    });

    // Pipe prompt via stdin to avoid OS argument length limits
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// Tool definition
const askCodexTool = {
  name: 'ask_codex',
  description: `Send a prompt to OpenAI Codex CLI for analytical/planning tasks. Codex excels at architecture review, planning validation, and critical analysis. Requires agent_role to specify the perspective (architect, planner, or critic). Requires Codex CLI (npm install -g @openai/codex).`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      prompt: { type: 'string', description: 'The prompt to send to Codex' },
      agent_role: {
        type: 'string',
        enum: CODEX_VALID_ROLES,
        description: `Required. Agent perspective for Codex: ${CODEX_VALID_ROLES.join(', ')}. Codex is optimized for analytical/planning tasks.`
      },
      model: { type: 'string', description: `Codex model to use (default: ${CODEX_DEFAULT_MODEL}). Set OMC_CODEX_DEFAULT_MODEL env var to change default.` },
      context_files: { type: 'array', items: { type: 'string' }, description: 'File paths to include as context (contents will be prepended to prompt)' },
    },
    required: ['prompt', 'agent_role'],
  },
};

// Create the MCP server
const server = new Server(
  {
    name: 'x',
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
    tools: [askCodexTool],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== 'ask_codex') {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const { prompt, agent_role, model = CODEX_DEFAULT_MODEL, context_files } = (args ?? {}) as {
    prompt: string;
    agent_role: CodexAgentRole;
    model?: string;
    context_files?: string[];
  };

  // Validate agent_role
  if (!agent_role || !CODEX_VALID_ROLES.includes(agent_role as CodexAgentRole)) {
    return {
      content: [{ type: 'text', text: `Invalid agent_role: "${agent_role}". Codex requires one of: ${CODEX_VALID_ROLES.join(', ')}` }],
      isError: true,
    };
  }

  // Check CLI availability
  const detection = detectCodexCli();
  if (!detection.available) {
    return {
      content: [{ type: 'text', text: `Codex CLI is not available: ${detection.error}\n\n${detection.installHint}` }],
      isError: true,
    };
  }

  // Resolve system prompt from agent role
  const resolvedSystemPrompt = resolveSystemPrompt(undefined, agent_role);

  // Build file context
  let fileContext: string | undefined;
  if (context_files && context_files.length > 0) {
    fileContext = context_files.map(f => {
      try {
        return `--- File: ${f} ---\n${readFileSync(f, 'utf-8')}`;
      } catch (err) {
        return `--- File: ${f} --- (Error reading: ${(err as Error).message})`;
      }
    }).join('\n\n');
  }

  // Combine: system prompt > file context > user prompt
  const fullPrompt = buildPromptWithSystemContext(prompt, fileContext, resolvedSystemPrompt);

  try {
    const response = await executeCodex(fullPrompt, model);
    return {
      content: [{ type: 'text', text: response }],
      isError: false,
    };
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Codex CLI error: ${(err as Error).message}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Codex MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start Codex server:', error);
  process.exit(1);
});
