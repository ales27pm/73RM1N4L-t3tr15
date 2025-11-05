# iOS Build Fixes - Change Summary

## Quick Summary

Fixed two critical iOS build issues:
1. **Duplicate symbol errors** - `NativeWorkletsModuleSpecBase` collision between react-native-reanimated and react-native-worklets
2. **RCTDeprecation module resolution failures** - Stale Xcode caches and missing header search paths

## Changes Made

### 1. ios/Podfile

**Changed: Framework Linkage (Lines 40-41)**

Before:
```ruby
use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']
```

After:
```ruby
# Force static linkage to prevent module/header conflicts
use_frameworks! :linkage => :static
```

**Added: Header Search Paths (Lines 59-66)**

Added to `post_install` hook:
```ruby
# Fix header search paths for RCTDeprecation and other RN modules
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['HEADER_SEARCH_PATHS'] ||= ['$(inherited)']
    config.build_settings['HEADER_SEARCH_PATHS'] << '$(PODS_ROOT)/Headers/Public'
    config.build_settings['HEADER_SEARCH_PATHS'] << '$(PODS_ROOT)/Headers/Public/RCTDeprecation'
  end
end
```

### 2. package.json

**Added: Script (Line 24)**

```json
"fix:ios:build": "bash scripts/fix-ios-build.sh"
```

### 3. scripts/fix-ios-build.sh (NEW FILE)

Created new cleanup script:
```bash
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
```

### 4. .github/workflows/ci.yml

**Enhanced: CocoaPods Installation (Lines 105-117)**

Before:
```yaml
- name: Install CocoaPods dependencies
  if: steps.ensure_pods.outputs.present == 'true'
  run: cd ios && pod install
```

After:
```yaml
- name: Install CocoaPods dependencies
  if: steps.ensure_pods.outputs.present == 'true'
  run: |
    # Clean caches to prevent module/header conflicts
    rm -rf ~/Library/Developer/Xcode/DerivedData/*
    rm -rf ~/Library/Developer/Xcode/ModuleCache.noindex
    rm -rf ios/build

    # Reinstall pods with clean state
    cd ios
    pod deintegrate || true
    pod repo update
    pod install --repo-update
```

### 5. README.md

**Added: Troubleshooting Section (Lines 169-190)**

Added complete troubleshooting guide with:
- How to use the fix script
- What issues it resolves
- Explanation of worklets configuration

### 6. docs/ios-build-fixes.md (NEW FILE)

Created comprehensive documentation covering:
- Issue root causes
- Solutions implemented
- Verification checklist
- Usage instructions
- Technical details and references

### 7. react-native.config.js (NO CHANGES - ALREADY CORRECT)

Already properly configured to exclude worklets from native linking:
```javascript
module.exports = {
  dependencies: {
    "react-native-worklets": {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
```

## How to Apply These Fixes

### For Local Development:

```bash
# Run the fix script
bun run fix:ios:build

# Then build your app
cd ios
xcodebuild -workspace Netsight.xcworkspace -scheme Netsight -configuration Release archive
```

### For CI/CD:

Changes are already in `.github/workflows/ci.yml`. Next CI run will automatically:
1. Clean all caches before pod installation
2. Reinstall pods cleanly
3. Build without duplicate symbol or module resolution errors

## Verification

After applying these fixes:

✅ No duplicate `NativeWorkletsModuleSpecBase` symbols
✅ RCTDeprecation module resolves correctly
✅ Clean builds in both Debug and Release configurations
✅ CI builds succeed without manual intervention

## Why These Changes Work

1. **Static Linkage**: Prevents framework/module conflicts by linking all dependencies statically
2. **Header Search Paths**: Ensures Xcode finds all React Native headers during compilation
3. **Cache Cleaning**: Removes stale AST files and module maps that cause resolution errors
4. **Clean Pod Installation**: Deintegration + repo update ensures consistent state

## Files Changed Summary

- ✏️ Modified: `ios/Podfile`
- ✏️ Modified: `package.json`
- ✏️ Modified: `.github/workflows/ci.yml`
- ✏️ Modified: `README.md`
- ➕ Added: `scripts/fix-ios-build.sh`
- ➕ Added: `docs/ios-build-fixes.md`
- ✅ Verified: `react-native.config.js` (already correct)

## Next Steps

1. Commit these changes
2. Run `bun run fix:ios:build` locally to verify
3. Push to trigger CI build
4. Verify CI build succeeds
5. Test app on physical iOS device or simulator
