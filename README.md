# Oh-My-Claude-Sisyphus

[![npm version](https://badge.fury.io/js/oh-my-claude-sisyphus.svg)](https://www.npmjs.com/package/oh-my-claude-sisyphus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Multi-agent orchestration system for [Claude Code](https://docs.anthropic.com/claude-code). Port of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode).

Like Sisyphus, these agents persist until every task is complete.

## Quick Install

### One-liner (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/Yeachan-Heo/oh-my-claude-sisyphus/main/scripts/install.sh | bash
```

### Via npm

```bash
npm install -g oh-my-claude-sisyphus
```

### Manual Install

```bash
git clone https://github.com/Yeachan-Heo/oh-my-claude-sisyphus.git
cd oh-my-claude-sisyphus
chmod +x scripts/install.sh
./scripts/install.sh
```

## What Gets Installed

The installer adds to your Claude Code config (`~/.claude/`):

```
~/.claude/
├── agents/
│   ├── oracle.md              # Architecture & debugging expert (Opus)
│   ├── librarian.md           # Documentation & research (Sonnet)
│   ├── explore.md             # Fast pattern matching (Haiku)
│   ├── frontend-engineer.md   # UI/UX specialist (Sonnet)
│   ├── document-writer.md     # Technical writing (Haiku)
│   ├── multimodal-looker.md   # Visual analysis (Sonnet)
│   ├── momus.md               # Plan reviewer (Opus)
│   ├── metis.md               # Pre-planning consultant (Opus)
│   ├── orchestrator-sisyphus.md # Todo coordinator (Sonnet)
│   ├── sisyphus-junior.md     # Focused executor (Sonnet)
│   └── prometheus.md          # Strategic planner (Opus)
├── commands/
│   ├── sisyphus.md         # /sisyphus command
│   ├── sisyphus-default.md # /sisyphus-default command
│   ├── ultrawork.md        # /ultrawork command
│   ├── deepsearch.md       # /deepsearch command
│   ├── analyze.md          # /analyze command
│   ├── plan.md             # /plan command (Prometheus)
│   └── review.md           # /review command (Momus)
└── CLAUDE.md               # Sisyphus system prompt
```

## Usage

### Start Claude Code

```bash
claude
```

### Slash Commands

| Command | Description |
|---------|-------------|
| `/sisyphus <task>` | Activate Sisyphus multi-agent orchestration mode |
| `/sisyphus-default` | Set Sisyphus as your permanent default mode |
| `/ultrawork <task>` | Maximum performance mode with parallel agents |
| `/deepsearch <query>` | Thorough multi-strategy codebase search |
| `/analyze <target>` | Deep analysis and investigation |
| `/plan <description>` | Start planning session with Prometheus |
| `/review [plan-path]` | Review a plan with Momus |

### Examples

```bash
# In Claude Code:

# Activate Sisyphus for a task
/sisyphus refactor the authentication module

# Set as default mode (persistent)
/sisyphus-default

# Use ultrawork for maximum performance
/ultrawork implement user dashboard with charts

# Deep search
/deepsearch API endpoints that handle user data

# Deep analysis
/analyze performance bottleneck in the database layer
```

### Magic Keywords

Just include these words anywhere in your prompt:

| Keyword | Effect |
|---------|--------|
| `ultrawork`, `ulw`, `uw` | Activates parallel agent orchestration |
| `search`, `find`, `locate` | Enhanced search mode |
| `analyze`, `investigate` | Deep analysis mode |

```bash
# These work in normal prompts too:
> ultrawork implement user authentication with OAuth

> find all files that import the utils module

> analyze why the tests are failing
```

## Available Agents

Claude will automatically delegate to these specialized agents:

### Task Execution Agents

| Agent | Model | Best For |
|-------|-------|----------|
| **oracle** | Opus | Complex debugging, architecture decisions, root cause analysis |
| **librarian** | Sonnet | Finding documentation, understanding code organization |
| **explore** | Haiku | Quick file searches, pattern matching, reconnaissance |
| **frontend-engineer** | Sonnet | UI components, styling, accessibility |
| **document-writer** | Haiku | README files, API docs, code comments |
| **multimodal-looker** | Sonnet | Analyzing screenshots, diagrams, mockups |

### Planning & Review Agents

| Agent | Model | Best For |
|-------|-------|----------|
| **prometheus** | Opus | Strategic planning, comprehensive work plans, interview-style requirement gathering |
| **momus** | Opus | Critical plan review, feasibility assessment, risk identification |
| **metis** | Opus | Pre-planning analysis, hidden requirement detection, ambiguity resolution |

### Orchestration Agents

| Agent | Model | Best For |
|-------|-------|----------|
| **orchestrator-sisyphus** | Sonnet | Todo coordination, task delegation, progress tracking |
| **sisyphus-junior** | Sonnet | Focused task execution, plan following, direct implementation |

### Manual Agent Invocation

You can explicitly request an agent:

```
Use the oracle agent to debug the memory leak in the worker process

Have the librarian find all documentation about the API

Ask explore to find all TypeScript files that import React
```

## Configuration

### Project-Level Config

Create `.claude/CLAUDE.md` in your project for project-specific instructions:

```markdown
# Project Context

This is a TypeScript monorepo using:
- Bun runtime
- React for frontend
- PostgreSQL database

## Conventions
- Use functional components
- All API routes in /src/api
- Tests alongside source files
```

### Agent Customization

Edit agent files in `~/.claude/agents/` to customize behavior:

```yaml
---
name: oracle
description: Your custom description
tools: Read, Grep, Glob, Bash, Edit
model: opus  # or sonnet, haiku
---

Your custom system prompt here...
```

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/Yeachan-Heo/oh-my-claude-sisyphus/main/scripts/uninstall.sh | bash
```

Or manually:

```bash
rm ~/.claude/agents/{oracle,librarian,explore,frontend-engineer,document-writer,multimodal-looker,momus,metis,orchestrator-sisyphus,sisyphus-junior,prometheus}.md
rm ~/.claude/commands/{sisyphus,sisyphus-default,ultrawork,deepsearch,analyze,plan,review}.md
```

## SDK Usage (Advanced)

For programmatic use with the Claude Agent SDK:

```bash
npm install oh-my-claude-sisyphus @anthropic-ai/claude-agent-sdk
```

```typescript
import { createSisyphusSession } from 'oh-my-claude-sisyphus';
import { query } from '@anthropic-ai/claude-agent-sdk';

const session = createSisyphusSession();

for await (const message of query({
  prompt: session.processPrompt("ultrawork implement feature X"),
  ...session.queryOptions
})) {
  console.log(message);
}
```

## How It Works

1. **Sisyphus Orchestrator**: The main Claude instance coordinates all work
2. **Specialized Subagents**: Each agent has focused expertise and tools
3. **Parallel Execution**: Independent tasks run concurrently
4. **Continuation Enforcement**: Agents persist until ALL tasks complete
5. **Context Injection**: Project-specific instructions from CLAUDE.md files

---

## Differences from oh-my-opencode

This is a port of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) adapted for Claude Code and the Claude Agent SDK. Here's what's different:

### Model Mapping

The original oh-my-opencode used multiple AI providers. This port uses Claude models exclusively:

| Agent | Original Model | Ported Model | Notes |
|-------|---------------|--------------|-------|
| **Sisyphus** | Claude Opus 4.5 | Claude Opus 4.5 | Same |
| **Oracle** | GPT-5.2 | Claude Opus | Was OpenAI's flagship for deep reasoning |
| **Librarian** | Claude Sonnet or Gemini 3 Flash | Claude Sonnet | Multi-provider → Claude only |
| **Explore** | Grok Code or Gemini 3 Flash | Claude Haiku 4.5 | Fast/cheap model for quick searches |
| **Frontend Engineer** | Gemini 3 Pro | Claude Sonnet | Was Google's model |
| **Document Writer** | Gemini 3 Flash | Claude Haiku 4.5 | Fast model for docs |
| **Multimodal Looker** | Various | Claude Sonnet | Visual analysis |
| **Momus** | GPT-5.2 | Claude Opus | Plan reviewer (Greek god of criticism) |
| **Metis** | Claude Opus 4.5 | Claude Opus | Pre-planning consultant (goddess of wisdom) |
| **Orchestrator-Sisyphus** | Claude Sonnet 4.5 | Claude Sonnet | Todo coordination and delegation |
| **Sisyphus-Junior** | Configurable | Claude Sonnet | Focused task executor |
| **Prometheus** | Planning System | Claude Opus | Strategic planner (fire-bringer) |

**Why Claude-only?** The Claude Agent SDK is designed for Claude models. Using Claude throughout provides:
- Consistent behavior and capabilities
- Simpler authentication (single API key)
- Native integration with Claude Code's tools

### Tools Comparison

#### Available Tools (via Claude Code)

| Tool | Status | Description |
|------|--------|-------------|
| **Read** | ✅ Available | Read files |
| **Write** | ✅ Available | Create files |
| **Edit** | ✅ Available | Modify files |
| **Bash** | ✅ Available | Run shell commands |
| **Glob** | ✅ Available | Find files by pattern |
| **Grep** | ✅ Available | Search file contents |
| **WebSearch** | ✅ Available | Search the web |
| **WebFetch** | ✅ Available | Fetch web pages |
| **Task** | ✅ Available | Spawn subagents |
| **TodoWrite** | ✅ Available | Track tasks |

#### LSP Tools (Real Implementation)

| Tool | Status | Description |
|------|--------|-------------|
| **lsp_hover** | ✅ Implemented | Get type info and documentation at position |
| **lsp_goto_definition** | ✅ Implemented | Jump to symbol definition |
| **lsp_find_references** | ✅ Implemented | Find all usages of a symbol |
| **lsp_document_symbols** | ✅ Implemented | Get file outline (functions, classes, etc.) |
| **lsp_workspace_symbols** | ✅ Implemented | Search symbols across workspace |
| **lsp_diagnostics** | ✅ Implemented | Get errors, warnings, hints |
| **lsp_prepare_rename** | ✅ Implemented | Check if rename is valid |
| **lsp_rename** | ✅ Implemented | Rename symbol across project |
| **lsp_code_actions** | ✅ Implemented | Get available refactorings |
| **lsp_code_action_resolve** | ✅ Implemented | Get details of a code action |
| **lsp_servers** | ✅ Implemented | List available language servers |

> **Note:** LSP tools require language servers to be installed (typescript-language-server, pylsp, rust-analyzer, gopls, etc.). Use `lsp_servers` to check installation status.

#### AST Tools (ast-grep Integration)

| Tool | Status | Description |
|------|--------|-------------|
| **ast_grep_search** | ✅ Implemented | Pattern-based code search using AST matching |
| **ast_grep_replace** | ✅ Implemented | Pattern-based code transformation |

> **Note:** AST tools use [@ast-grep/napi](https://ast-grep.github.io/) for structural code matching. Supports meta-variables like `$VAR` (single node) and `$$$` (multiple nodes).

### Features Comparison

#### Fully Implemented ✅

| Feature | Description |
|---------|-------------|
| **11 Specialized Agents** | Oracle, Librarian, Explore, Frontend Engineer, Document Writer, Multimodal Looker, Momus, Metis, Orchestrator-Sisyphus, Sisyphus-Junior, Prometheus |
| **Magic Keywords** | `ultrawork`, `search`, `analyze` trigger enhanced modes |
| **Slash Commands** | `/sisyphus`, `/sisyphus-default`, `/ultrawork`, `/deepsearch`, `/analyze`, `/plan`, `/review` |
| **Configuration System** | JSONC config with multi-source merging |
| **Context Injection** | Auto-loads CLAUDE.md and AGENTS.md files |
| **Continuation Enforcement** | System prompt enforces task completion |
| **MCP Server Configs** | Exa, Context7, grep.app server definitions |
| **LSP Tools** | Real LSP server integration with 11 tools |
| **AST Tools** | ast-grep integration for structural code search/replace |

#### Partially Implemented ⚠️

| Feature | What Works | What's Missing |
|---------|------------|----------------|
| **Continuation Hook** | System prompt enforcement | Actual todo state checking |

#### Not Implemented ❌

| Feature | Original Capability | Why Not Ported |
|---------|---------------------|----------------|
| **22 Lifecycle Hooks** | PreToolUse, PostToolUse, Stop, etc. | Claude Code handles hooks differently |
| **Background Task Manager** | Async agent execution with concurrency limits | Claude Code's Task tool handles this |
| **Context Window Compaction** | Multi-stage recovery when hitting token limits | Claude Code manages this internally |
| **Thinking Block Validator** | Validates AI thinking format | Not needed for Claude |
| **Multi-Model Routing** | Route to GPT/Gemini/Grok based on task | Claude-only by design |
| **Per-Model Concurrency** | Fine-grained concurrency per provider | Single provider simplifies this |
| **Interactive Bash + Tmux** | Advanced terminal with Tmux integration | Standard Bash tool sufficient |

### Architecture Differences

```
oh-my-opencode (Original)          oh-my-claude-sisyphus (Port)
─────────────────────────          ────────────────────────────
┌─────────────────────┐            ┌─────────────────────┐
│   OpenCode Plugin   │            │    Claude Code      │
│   (Bun runtime)     │            │    (Native CLI)     │
└─────────┬───────────┘            └─────────┬───────────┘
          │                                  │
┌─────────▼───────────┐            ┌─────────▼───────────┐
│  Multi-Provider     │            │   Claude Agent SDK  │
│  Orchestration      │            │   (Claude only)     │
│  ┌───┐ ┌───┐ ┌───┐  │            └─────────┬───────────┘
│  │GPT│ │Gem│ │Grok│ │                      │
│  └───┘ └───┘ └───┘  │            ┌─────────▼───────────┐
└─────────┬───────────┘            │  ~/.claude/agents/  │
          │                        │  (Markdown configs) │
┌─────────▼───────────┐            └─────────────────────┘
│  Custom Tool Layer  │
│  (LSP, AST, etc.)   │
└─────────────────────┘
```

**Key Architectural Changes:**

1. **Plugin → Native Integration**: Original was an OpenCode plugin; this uses Claude Code's native agent/command system
2. **Multi-Provider → Single Provider**: Simplified to Claude-only for consistency
3. **Custom Runtime → Claude Code Runtime**: Leverages Claude Code's built-in capabilities
4. **Programmatic Config → Markdown Files**: Agents defined as `.md` files in `~/.claude/agents/`

### What You Gain

- **Simpler Setup**: One curl command vs. multi-step plugin installation
- **Native Integration**: Works directly with Claude Code, no plugin layer
- **Consistent Behavior**: All agents use Claude, no cross-model quirks
- **Easier Customization**: Edit markdown files to customize agents

### What You Lose

- **Model Diversity**: Can't use GPT-5.2 for Oracle's deep reasoning
- **Advanced Hooks**: Fewer lifecycle interception points (22 hooks → system prompt enforcement)

### Migration Tips

If you're coming from oh-my-opencode:

1. **Oracle Tasks**: Claude Opus handles architecture/debugging well, but differently than GPT-5.2
2. **LSP Workflows**: All LSP tools are available! Use `lsp_servers` to check which servers are installed
3. **AST Searches**: Use `ast_grep_search` with pattern syntax (e.g., `function $NAME($$$)`)
4. **Background Tasks**: Claude Code's `Task` tool with `run_in_background` works similarly
5. **Planning**: Use `/plan` command to start a planning session with Prometheus

---

## Requirements

- [Claude Code](https://docs.anthropic.com/claude-code) installed
- Anthropic API key (`ANTHROPIC_API_KEY` environment variable)

## License

MIT - see [LICENSE](LICENSE)

## Credits

Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by code-yeongyu.
