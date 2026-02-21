#!/bin/bash
# Pull latest changes from remote branch

# Get current branch name
BRANCH=$(git branch --show-current)

echo "Current branch: $BRANCH"
echo "Pulling latest changes from origin/$BRANCH..."

# Pull changes from remote
git pull origin "$BRANCH"

# Check status
if [ $? -eq 0 ]; then
    echo "✅ Successfully pulled updates from origin/$BRANCH"
    git status
else
    echo "❌ Failed to pull updates"
    exit 1
fi
