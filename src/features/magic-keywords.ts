/**
 * Magic Keywords Feature
 *
 * Detects special keywords in prompts and activates enhanced behaviors:
 * - ultrawork/ulw: Maximum performance mode with parallel orchestration
 * - search/find: Maximized search effort
 * - analyze/investigate: Deep analysis mode
 */

import type { MagicKeyword, PluginConfig } from '../shared/types.js';

/**
 * Ultrawork mode enhancement
 * Activates maximum performance with parallel agent orchestration
 */
const ultraworkEnhancement: MagicKeyword = {
  triggers: ['ultrawork', 'ulw', 'uw'],
  description: 'Activates maximum performance mode with parallel agent orchestration',
  action: (prompt: string) => {
    // Remove the trigger word and add enhancement instructions
    const cleanPrompt = removeTriggerWords(prompt, ['ultrawork', 'ulw', 'uw']);

    return `[ULTRAWORK MODE ACTIVATED]

${cleanPrompt}

## Enhanced Execution Instructions
- Use PARALLEL agent execution for all independent subtasks
- Delegate aggressively to specialized subagents
- Maximize throughput by running multiple operations concurrently
- Continue until ALL tasks are 100% complete - verify before stopping
- Use background agents for long-running operations
- Report progress frequently

## Subagent Strategy
- Use 'oracle' for complex debugging and architecture decisions
- Use 'librarian' for documentation and codebase research
- Use 'explore' for quick pattern matching and file searches
- Use 'frontend-engineer' for UI/UX work
- Use 'document-writer' for documentation tasks
- Use 'multimodal-looker' for analyzing images/screenshots

CRITICAL: Do NOT stop until every task is verified complete.`;
  }
};

/**
 * Search mode enhancement
 * Maximizes search effort and thoroughness
 */
const searchEnhancement: MagicKeyword = {
  triggers: ['search', 'find', 'locate'],
  description: 'Maximizes search effort and thoroughness',
  action: (prompt: string) => {
    // Check if search-related triggers are present as commands
    const hasSearchCommand = /\b(search|find|locate)\b/i.test(prompt);

    if (!hasSearchCommand) {
      return prompt;
    }

    return `${prompt}

## Search Enhancement Instructions
- Use multiple search strategies (glob patterns, grep, AST search)
- Search across ALL relevant file types
- Include hidden files and directories when appropriate
- Try alternative naming conventions (camelCase, snake_case, kebab-case)
- Look in common locations: src/, lib/, utils/, helpers/, services/
- Check for related files (tests, types, interfaces)
- Report ALL findings, not just the first match
- If initial search fails, try broader patterns`;
  }
};

/**
 * Analyze mode enhancement
 * Activates deep analysis and investigation mode
 */
const analyzeEnhancement: MagicKeyword = {
  triggers: ['analyze', 'investigate', 'examine', 'debug'],
  description: 'Activates deep analysis and investigation mode',
  action: (prompt: string) => {
    // Check if analysis-related triggers are present
    const hasAnalyzeCommand = /\b(analyze|investigate|examine|debug)\b/i.test(prompt);

    if (!hasAnalyzeCommand) {
      return prompt;
    }

    return `${prompt}

## Deep Analysis Instructions
- Thoroughly examine all relevant code paths
- Trace data flow from source to destination
- Identify edge cases and potential failure modes
- Check for related issues in similar code patterns
- Use LSP tools for type information and references
- Use AST tools for structural code analysis
- Document findings with specific file:line references
- Propose concrete solutions with code examples
- Consider performance, security, and maintainability implications`;
  }
};

/**
 * Remove trigger words from a prompt
 */
function removeTriggerWords(prompt: string, triggers: string[]): string {
  let result = prompt;
  for (const trigger of triggers) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'gi');
    result = result.replace(regex, '');
  }
  return result.trim();
}

/**
 * All built-in magic keyword definitions
 */
export const builtInMagicKeywords: MagicKeyword[] = [
  ultraworkEnhancement,
  searchEnhancement,
  analyzeEnhancement
];

/**
 * Create a magic keyword processor with custom triggers
 */
export function createMagicKeywordProcessor(config?: PluginConfig['magicKeywords']): (prompt: string) => string {
  const keywords = [...builtInMagicKeywords];

  // Override triggers from config
  if (config) {
    if (config.ultrawork) {
      const ultrawork = keywords.find(k => k.triggers.includes('ultrawork'));
      if (ultrawork) {
        ultrawork.triggers = config.ultrawork;
      }
    }
    if (config.search) {
      const search = keywords.find(k => k.triggers.includes('search'));
      if (search) {
        search.triggers = config.search;
      }
    }
    if (config.analyze) {
      const analyze = keywords.find(k => k.triggers.includes('analyze'));
      if (analyze) {
        analyze.triggers = config.analyze;
      }
    }
  }

  return (prompt: string): string => {
    let result = prompt;

    for (const keyword of keywords) {
      const hasKeyword = keyword.triggers.some(trigger => {
        const regex = new RegExp(`\\b${trigger}\\b`, 'i');
        return regex.test(result);
      });

      if (hasKeyword) {
        result = keyword.action(result);
      }
    }

    return result;
  };
}

/**
 * Check if a prompt contains any magic keywords
 */
export function detectMagicKeywords(prompt: string, config?: PluginConfig['magicKeywords']): string[] {
  const detected: string[] = [];
  const keywords = [...builtInMagicKeywords];

  // Apply config overrides
  if (config) {
    if (config.ultrawork) {
      const ultrawork = keywords.find(k => k.triggers.includes('ultrawork'));
      if (ultrawork) ultrawork.triggers = config.ultrawork;
    }
    if (config.search) {
      const search = keywords.find(k => k.triggers.includes('search'));
      if (search) search.triggers = config.search;
    }
    if (config.analyze) {
      const analyze = keywords.find(k => k.triggers.includes('analyze'));
      if (analyze) analyze.triggers = config.analyze;
    }
  }

  for (const keyword of keywords) {
    for (const trigger of keyword.triggers) {
      const regex = new RegExp(`\\b${trigger}\\b`, 'i');
      if (regex.test(prompt)) {
        detected.push(trigger);
        break;
      }
    }
  }

  return detected;
}
