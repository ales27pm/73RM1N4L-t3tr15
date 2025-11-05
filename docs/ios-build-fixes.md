# iOS Build Fix Documentation

## Overview

This document explains the iOS build issues encountered with React Native 0.79.2 + Expo SDK 53 and the solutions implemented.

## Issues Identified

### 1. Duplicate Symbol Errors

**Error Message:**
```
duplicate symbol '_OBJC_CLASS_$_NativeWorkletsModuleSpecBase' in:
  .../libReactCodegen.a[71](rnworklets-generated.o)
  .../libReactCodegen.a[63](rnreanimated-generated.o)
```

**Root Cause:**
- `react-native-reanimated` v3+ includes its own worklets implementation
- `react-native-worklets` (used for Babel transforms) was also being autolinked
- Both libraries expose `NativeWorkletsModuleSpecBase`, causing linker collision

**Solution:**
- Excluded `react-native-worklets` from iOS/Android autolinking via `react-native.config.js`
- Kept the package as devDependency for Babel plugin only

### 2. RCTDeprecation Module Resolution Failure

**Error Message:**
```
fatal error: module 'RCTDeprecation' in AST file '.../Pods/Headers/Public/RCTDeprecation/RCTDeprecation.modulemap'
note: consider adding '.../Pods/Headers/Public/RCTDeprecation' to the header search path
```

**Root Cause:**
- Stale Xcode DerivedData and ModuleCache
- Inconsistent header search paths in Podfile
- RCTDeprecation headers not in public search paths

**Solution:**
- Added explicit header search paths in Podfile post_install hook
- Cache cleaning before CocoaPods installation
- Force static framework linkage

## Files Modified

### 1. `react-native.config.js`

Already configured correctly to exclude worklets from native linking:

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

### 2. `ios/Podfile`

**Changes Made:**

a) **Force Static Linkage:**
```ruby
# Force static linkage to prevent module/header conflicts
use_frameworks! :linkage => :static
```

b) **Add Header Search Paths:**
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

### 3. `scripts/fix-ios-build.sh`

Created cleanup script that:
1. Removes Xcode DerivedData
2. Removes Xcode ModuleCache
3. Cleans iOS build artifacts
4. Deintegrates and reinstalls CocoaPods with repo update

### 4. `.github/workflows/ci.yml`

Updated iOS build job to clean caches before CocoaPods installation:
```yaml
- name: Install CocoaPods dependencies
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

## Usage

### Local Development

When encountering iOS build issues:

```bash
bun run fix:ios:build
```

Or manually:

```bash
# Clean caches
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/ModuleCache.noindex
rm -rf ios/build

# Reinstall pods
cd ios
pod deintegrate
pod repo update
pod install --repo-update
```

### CI/CD (GitHub Actions)

The CI workflow now automatically:
1. Cleans all relevant caches before pod installation
2. Uses `pod deintegrate` to ensure clean state
3. Runs `pod repo update` for latest pod specs
4. Installs with `--repo-update` flag

## Verification Checklist

✅ `react-native-worklets` excluded from native linking
✅ Static framework linkage enabled in Podfile
✅ Header search paths include `$(PODS_ROOT)/Headers/Public`
✅ CI cleans DerivedData and ModuleCache before builds
✅ `pod install --repo-update` used consistently

## Why This Works

1. **Static Linkage**: Prevents module/framework conflicts by linking everything statically
2. **Header Search Paths**: Ensures Xcode can find RCTDeprecation and other RN headers during compilation
3. **Cache Cleaning**: Removes stale AST files and module maps that cause "module in AST file" errors
4. **Clean Pod Installation**: Deintegration + repo update ensures consistent pod state

## Additional Notes

- **React Native 0.79.2**: This version introduced stricter module resolution
- **Expo SDK 53**: Uses autolinking that must be carefully configured
- **Reanimated v3**: Bundles its own worklets; no separate worklets library needed
- **Worklets Babel Plugin**: We keep `react-native-worklets` as devDependency for Babel transforms only

## References

- [React Native 0.79 Release Notes](https://github.com/facebook/react-native/releases/tag/v0.79.0)
- [Reanimated v3 Worklets](https://docs.swmansion.com/react-native-reanimated/)
- [Expo Autolinking](https://docs.expo.dev/modules/autolinking/)
- [CocoaPods Best Practices](https://guides.cocoapods.org/using/using-cocoapods.html)

## Support

If issues persist after applying these fixes:

1. Verify all changes are committed
2. Run `bun run fix:ios:build` locally
3. Try building on a clean CI runner
4. Check Xcode build logs for specific error messages
5. Ensure no custom Xcode build settings conflict with Podfile configuration
