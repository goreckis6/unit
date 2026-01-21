#!/bin/bash

# Build script for Qwik that creates temporary src/ structure
# This is needed because Qwik City requires standard src/ structure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔧 Preparing Qwik build structure..."

# Check if src/ exists (would conflict with Vue)
if [ -d "src" ] && [ ! -L "src" ]; then
  echo "❌ Error: src/ directory exists and is not a symlink"
  echo "   Qwik requires src/ structure, but Vue uses src/ too"
  echo "   Solution: This script needs src/ to be available for Qwik"
  exit 1
fi

# Create symlink src -> src-qwik if it doesn't exist
if [ ! -e "src" ]; then
  echo "📦 Creating symlink: src -> src-qwik"
  ln -s src-qwik src
  SYMLINK_CREATED=true
else
  SYMLINK_CREATED=false
fi

# Build Qwik
echo "🏗️  Building Qwik..."
npm run build:qwik:internal || {
  BUILD_EXIT_CODE=$?
  # Cleanup symlink if we created it
  if [ "$SYMLINK_CREATED" = true ]; then
    echo "🧹 Cleaning up symlink..."
    rm -f src
  fi
  exit $BUILD_EXIT_CODE
}

# Cleanup symlink if we created it
if [ "$SYMLINK_CREATED" = true ]; then
  echo "🧹 Cleaning up symlink..."
  rm -f src
fi

echo "✅ Qwik build complete!"

