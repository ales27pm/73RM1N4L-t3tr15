# React T3TR15 - Retro Terminal Tetris

A cyberpunk-themed Tetris game built with React Native and Expo, featuring Matrix-style rain effects, glitch animations, and a retro terminal aesthetic.

## 🎮 Features

### Game Mechanics
- **Classic Tetris Gameplay**: Standard tetromino pieces with rotation and movement
- **Difficulty Tiers**: Progressive difficulty system (Chill → Steady → Intense → Overdrive)
- **Adaptive Difficulty**: Dynamic level progression based on:
  - Lines cleared
  - Combo count
  - Lock duration (speed of piece placement)
  - Survival bonus
- **Ghost Piece**: Preview where piece will land
- **Hold Piece**: Store a piece for later use
- **DAS/ARR Controls**: Configurable delayed auto-shift and auto-repeat rate

### Visual Effects
- **Matrix Rain**: Animated Japanese katakana/numbers rain effect in the background
- **Glitch FX**: CRT-style glitch effects on line clears
- **Scanline Animation**: Moving scanline overlay for authentic terminal feel
- **ASCII Art Board**: Glyphs change based on piece color with subtle flicker
- **Slash Trail**: Visual feedback for gesture controls
- **Line Clear Flash**: Pulsing animation on cleared rows

### Audio
- **Sound Effects**: Toggle-able SFX for:
  - Piece movement
  - Rotation
  - Soft/Hard drop
  - Line clear
  - Hold piece
  - Game over

### Settings
- **Persistent Settings**: Saved to AsyncStorage
  - Matrix Rain (on/off)
  - Glitch Effects (on/off)
  - Sound Effects (on/off)
  - Ghost Piece (on/off)
  - Grid Lines (on/off)
  - Slash Trail (on/off)
  - Haptic Feedback (on/off)
  - DAS (Delayed Auto Shift)
  - ARR (Auto Repeat Rate)

## 🏗️ Tech Stack

### Core
- **React Native 0.79.2**: Latest stable version
- **Expo SDK 53**: Managed workflow with native builds
- **TypeScript**: Strict mode enabled
- **Zustand**: State management with persistence

### UI & Animation
- **NativeWind**: TailwindCSS for React Native
- **React Native Reanimated 3.19.3**: High-performance animations
- **React Native Gesture Handler**: Touch gestures

### Development
- **Bun**: Fast package manager and test runner
- **TypeScript 5.x**: Type safety
- **ESLint 9**: Flat config with React/TypeScript rules
- **Jest**: Unit testing
- **Detox**: E2E testing
- **GitHub Actions**: CI/CD pipeline

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable components
│   │   ├── MatrixRain.tsx   # Background rain effect
│   │   ├── SlashTrail.tsx   # Gesture trail effect
│   │   ├── MinimalModal.tsx # Settings/game over modal
│   │   ├── ChatInterface.tsx # Chat component with streaming API support
│   │   └── ErrorBanner.tsx  # Error display component
│   │
│   ├── screens/             # App screens
│   │   ├── TetrisScreen.tsx         # Main game screen
│   │   ├── Onboarding/              # First-time user flow
│   │   ├── Rewards/                 # Achievement system
│   │   └── Notifications/           # Notification settings
│   │
│   ├── state/               # State management
│   │   ├── tetrisStore.ts   # Game state with Zustand
│   │   ├── appStore.ts      # App-wide state
│   │   ├── engine.ts        # Game logic
│   │   ├── tetrominoes.ts   # Piece definitions
│   │   └── __tests__/       # Unit tests
│   │
│   ├── design-system/       # Design tokens and components
│   │   ├── tokens.ts        # Colors, spacing, typography
│   │   ├── components/      # Styled primitives
│   │   └── animations/      # Reusable animation hooks
│   │
│   ├── navigation/          # React Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── MainTabsNavigator.tsx
│   │
│   ├── utils/               # Utilities
│   │   ├── ascii.ts         # ASCII glyph mapping
│   │   ├── sfx.ts           # Sound effects
│   │   ├── logger.ts        # Logging utility
│   │   └── errors.ts        # Error handling
│   │
│   ├── mainLoop/            # Game loop
│   │   └── useMainLoop.ts   # Custom hook for game tick
│   │
│   ├── rewards/             # Achievement system
│   │   └── rewardEngine.ts
│   │
│   └── notifications/       # Push notification service
│       └── notificationService.ts
│
├── android/                 # Android native code
├── ios/                     # iOS native code
├── assets/                  # Images, fonts, sounds
├── docs/                    # Documentation
├── e2e/                     # End-to-end tests
├── scripts/                 # Build and automation scripts
└── patches/                 # npm package patches
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run start

# Run on iOS
bun run ios

# Run on Android
bun run android
```

### Development Commands

```bash
# Type checking
bun run typecheck

# Linting
bun run lint
bun run lint:fix

# Testing
bun test                    # Unit tests
bun run test:e2e:ios       # E2E tests (iOS)
bun run test:e2e:android   # E2E tests (Android)

# Asset generation
bun run assets:generate

# iOS build troubleshooting
bun run fix:ios:build
```

## 📦 Android Release Builds

Expo builds run in non-interactive mode, so the Android release keystore must exist before Gradle starts.
The repository keeps credentials in `credentials.json`, but the keystore binary itself is generated on
the fly to avoid committing secrets.

1. Ensure the following environment variables are set if you need custom credentials. The defaults
   match `credentials.json` and work for internal builds:
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`
   - Optional: `ANDROID_KEYSTORE_DNAME`
2. Run `npm run android:keystore` (or let the EAS `production` profile call it via the `pre-build`
   hook) to create `android/app/netsight-release-key.jks`.
3. Trigger `eas build --platform android --profile production` as usual. The generated keystore will
   be consumed by Gradle via `android/gradle.properties`.

The script is idempotent; rerunning it simply confirms that the keystore already exists.

## 🔧 Troubleshooting

### iOS Build Issues

If you encounter duplicate symbol errors or module resolution issues during iOS builds, run:

```bash
bun run fix:ios:build
```

This script will:
- Clean Xcode DerivedData and ModuleCache
- Remove old build artifacts
- Reinstall CocoaPods dependencies cleanly

**Common Issues Fixed:**
- Duplicate symbol `NativeWorkletsModuleSpecBase` (react-native-reanimated + worklets conflict)
- Module `RCTDeprecation` in AST file errors
- Module map file not found errors
- Header search path resolution issues
- **'yoga/Yoga.h' file not found** (React Native 0.79+ Yoga layout engine with New Architecture)
- Linker command failures with exit code 1
- libdav1d assembly compilation errors with C++ headers

**Podfile Fixes Applied:**
The Podfile includes several critical fixes for React Native 0.79+ with New Architecture:
- **Static framework linkage** (`use_frameworks! :linkage => :static`) to prevent module/header conflicts
- **Non-modular includes enabled** (`CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES`) for Yoga and React pods in post_install hook
- Header search paths for RCTDeprecation and other RCT modules
- Yoga header search paths for React Native 0.79+ layout engine
- Swift include paths for proper module resolution
- Module map configuration for bridging headers
- Precompiled header optimization for React Native targets
- libdav1d assembly file isolation to prevent C++ header conflicts

**Why These Fixes Matter:**
In React Native 0.79+ with New Architecture enabled, Yoga (the layout engine) headers must be accessible to ReactCommon compilation units. When using `use_frameworks!` with static linkage, CocoaPods enables modular headers automatically (via Expo's configuration). The `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES=YES` setting ensures that ReactCommon can still access Yoga headers using the `<yoga/Yoga.h>` include style, preventing the "file not found" compilation error.

**EAS Build Configuration:**
For EAS cloud builds, a prebuild hook (`scripts/eas-prebuild-ios.sh`) automatically cleans caches before building to prevent module map conflicts.

**Note**: The project no longer includes `react-native-worklets` as it conflicted with `react-native-reanimated` v3's built-in worklets support. This duplicate dependency caused linker errors with duplicate symbol `NativeWorkletsModuleSpecBase` during iOS builds.

## 🎯 Game Controls

### Touch Controls (Gestures)
- **Swipe Left/Right**: Move piece horizontally
- **Swipe Down**: Soft drop
- **Swipe Up**: Rotate piece clockwise
- **Tap Hold Button**: Store current piece

### Keyboard (Web/Simulator)
- **Arrow Left/Right**: Move piece
- **Arrow Down**: Soft drop
- **Arrow Up**: Rotate
- **Space**: Hard drop
- **C/Shift**: Hold piece

## 🧪 Testing

### Unit Tests
```bash
bun test
```

Tests cover:
- Game engine logic (collision, rotation, line clearing)
- Tetris store state mutations
- App store state management
- Difficulty progression calculations

### E2E Tests
```bash
bun run test:e2e:ios
```

Tests cover:
- Core game flows
- Onboarding journey
- Settings persistence

## 📊 Difficulty System

The game features an adaptive difficulty system with 4 tiers:

| Tier | Level | Description |
|------|-------|-------------|
| **Chill** | 0-2 | Relaxed pace for beginners |
| **Steady** | 3-6 | Moderate challenge |
| **Intense** | 7-11 | Fast-paced gameplay |
| **Overdrive** | 12-29 | Maximum difficulty |

### Progression Formula
Difficulty increases based on:
- **Line Clears**: More points for 2-4 lines (Tetris!)
- **Combo Multiplier**: Bonus for consecutive line clears
- **Lock Speed**: Rewards quick placement
- **Survival**: Small bonus for staying alive

## 🎨 Customization

### Tailwind Configuration
Edit `tailwind.config.js` to customize colors, spacing, and design tokens.

### Game Settings
All game settings are stored in `src/state/tetrisStore.ts` and persisted to AsyncStorage.

### Visual Effects
- Matrix Rain: `src/components/MatrixRain.tsx`
- Glitch Effects: Controlled in `TetrisScreen.tsx` via `glitchFxEnabled`
- ASCII Glyphs: Mapping in `src/utils/ascii.ts`

## 🔧 Configuration Files

- `app.config.ts`: Expo configuration
- `tsconfig.json`: TypeScript settings
- `babel.config.js`: Babel plugins and presets
- `metro.config.js`: Metro bundler configuration
- `jest.config.js`: Jest test configuration
- `detox.config.js`: E2E test configuration

## 🤝 Contributing

This project uses:
- **Conventional Commits**: For commit messages
- **ESLint**: Code linting
- **TypeScript Strict Mode**: Type safety
- **GitHub Actions**: Automated CI/CD

## 🚀 Release Automation

We rely on Expo Application Services (**EAS Build**) to deliver production binaries. The workflow at
`.github/workflows/build-sign.yml` installs the EAS CLI and triggers remote builds against the profiles defined in `eas.json`.
Kick off builds from the GitHub **Actions** tab with the `workflow_dispatch` trigger to generate store-ready Android and iOS
artifacts.

### Required GitHub Secrets

| Secret | Purpose |
| --- | --- |
| `EXPO_TOKEN` | Expo access token with permission to run builds and read hosted artifacts. Generate one via `eas token:create`. |
| `IOS_APPLE_TEAM_ID` | The 10-character Apple Developer Team ID that matches the provisioning profile. Used to stamp `credentials.json` before triggering iOS builds. |

### Local credential inputs

Store signing assets for the production iOS build in GitHub Actions secrets. The workflow decodes these variables into
`ios/certs/` through `scripts/ensure-ios-distribution-credentials.mjs` before triggering the EAS job:

| Secret | Description |
| --- | --- |
| `IOS_DISTRIBUTION_CERT_BASE64` | Base64-encoded `.p12` export of the iOS distribution certificate. Export it **without a password** so EAS can decrypt it via the blank password stored in `credentials.json`. |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64-encoded `.mobileprovision` profile that matches the production bundle identifier. |
| `IOS_APPLE_TEAM_ID` | Mirrors the Required GitHub Secret above so the workflow can update `credentials.json` with the correct Team ID before dispatching the build. |

The helper rewrites `credentials.json` only when the recorded Team ID differs from the supplied secret, keeping the file pristine for local development while ensuring remote builds always include the correct signing metadata.

When the secrets are unavailable the workflow emits a warning and skips the iOS build so Android production artifacts can
still be generated. Provide the signing blobs (or set `REQUIRE_IOS_CREDENTIALS=true` in the workflow environment) to
force the dispatch to fail when iOS credentials are absent.

### Workflow Inputs

- **Platform**: Build Android, iOS, or both with a single dispatch.
- **Profile**: Selects the EAS build profile (`production`, `preview`, or `development`).

Each successful run writes the latest build IDs and hosted download links to the workflow summary. Artifacts remain accessible
from the Expo dashboard or through the `eas build:list` and `eas build:download` CLI commands.

## 📝 License

MIT License - See LICENSE file for details

## 🎮 Credits

Original concept inspired by classic Tetris with a cyberpunk aesthetic.

Built with ❤️ using React Native and Expo.

---

**Current Version**: 1.0.0
**Last Updated**: November 5, 2025
**Expo SDK**: 53
**React Native**: 0.79.2

## Recent Updates (Nov 5, 2025)

### Code Quality Improvements
- Fixed all ESLint warnings across the codebase
- Removed unused imports and variables following best practices
- Improved code documentation with inline comments
- All TypeScript type checks passing

### Build System
- Podfile includes complete Yoga header search paths for React Native 0.79+
- CI/CD workflow includes automated cache cleaning for iOS builds
- EAS prebuild script ensures clean build environment
- All build scripts tested and verified

### Project Health
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ All navigation screens properly registered
- ✅ Zustand stores using proper selectors
- ✅ Safe area handling follows best practices

### New Components
- **ChatInterface**: Added reusable chat component with streaming API support
  - Comprehensive error handling for streaming responses
  - Checks for response body existence before iteration
  - Preserves partial content when stream is interrupted
  - AbortController support for request cancellation
  - User-friendly error messages in chat UI
  - TypeScript types for type safety

### Recent Fixes
- **Notification Service**: Fixed NativeEventEmitter initialization error
  - Converted `expo-notifications` import to dynamic/lazy loading pattern
  - Created `getNotifications()` helper using dynamic `import()` to defer module loading
  - All notification functions now load expo-notifications only when actually called
  - Prevents "requires a non-null argument" error on app startup
  - Ensures proper initialization timing - module only loads after native runtime is ready
  - Uses type-only imports (`import type`) to maintain TypeScript type safety without triggering initialization
  - App.tsx uses `InteractionManager.runAfterInteractions()` for optimal initialization timing

