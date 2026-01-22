#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🔍 Pre-publish checks..."

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}✗ Uncommitted changes. Commit first.${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Clean working tree"

# Get versions
LOCAL=$(node -p "require('./package.json').version")
REMOTE=$(npm view @ma.vu/killport version 2>/dev/null || echo "0.0.0")

# Check version not already published
if [[ "$LOCAL" == "$REMOTE" ]]; then
  echo -e "${RED}✗ Version $LOCAL already published!${NC}"
  echo "  Run: npm version patch|minor|major"
  exit 1
fi
echo -e "${GREEN}✓${NC} Version $LOCAL ready (remote: $REMOTE)"

# Run tests
echo "🧪 Running tests..."
npm test
echo -e "${GREEN}✓${NC} Tests passed"

echo ""
echo "📦 Publishing @ma.vu/killport@$LOCAL..."
