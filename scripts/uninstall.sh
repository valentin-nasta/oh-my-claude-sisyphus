#!/bin/bash
# Oh-My-Claude-Sisyphus Uninstaller

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Oh-My-Claude-Sisyphus Uninstaller${NC}"
echo ""

# Claude Code config directory (always ~/.claude)
CLAUDE_CONFIG_DIR="$HOME/.claude"

echo "This will remove Sisyphus agents and commands from:"
echo "  $CLAUDE_CONFIG_DIR"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo -e "${BLUE}Removing agents...${NC}"
rm -f "$CLAUDE_CONFIG_DIR/agents/oracle.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/librarian.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/explore.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/frontend-engineer.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/document-writer.md"
rm -f "$CLAUDE_CONFIG_DIR/agents/multimodal-looker.md"

echo -e "${BLUE}Removing commands...${NC}"
rm -f "$CLAUDE_CONFIG_DIR/commands/sisyphus.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/sisyphus-default.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/ultrawork.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/deepsearch.md"
rm -f "$CLAUDE_CONFIG_DIR/commands/analyze.md"

echo ""
echo -e "${GREEN}Uninstallation complete!${NC}"
echo -e "${YELLOW}Note: CLAUDE.md was not removed. Delete manually if desired:${NC}"
echo "  rm $CLAUDE_CONFIG_DIR/CLAUDE.md"
