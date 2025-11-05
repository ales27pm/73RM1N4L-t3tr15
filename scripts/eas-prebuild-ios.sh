#!/bin/bash
set -e

echo "🧹 EAS iOS Prebuild: Cleaning caches..."

# Clean any existing derived data and module cache
rm -rf ~/Library/Developer/Xcode/DerivedData/* || true
rm -rf ~/Library/Developer/Xcode/ModuleCache.noindex || true

# Clean local iOS build artifacts
rm -rf ios/build || true

echo "✅ EAS iOS Prebuild: Cache cleaning complete"
