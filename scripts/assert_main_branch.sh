#!/usr/bin/env bash

# Capture the current Git branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Assert that the current branch is "main"
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Error: Failed to assert that the current branch is 'main'."
  exit 1
fi