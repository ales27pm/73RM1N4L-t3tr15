#!/bin/bash
set -e

echo "🧹 Cleaning Xcode caches and build artifacts..."

# Clean Xcode derived data and module cache
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/ModuleCache.noindex

# Clean iOS build artifacts
rm -rf ios/build
rm -rf ios/Pods

echo "📦 Reinstalling CocoaPods dependencies..."
cd ios

# Deintegrate and reinstall pods
pod deintegrate || true
pod repo update
pod install --repo-update

cd ..

echo "✅ Done! Your iOS build environment has been cleaned and pods reinstalled."
echo "You can now build your app with: cd ios && xcodebuild -workspace Netsight.xcworkspace -scheme Netsight -configuration Release archive"
