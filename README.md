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
│   │   └── MinimalModal.tsx # Settings/game over modal
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
- **'yoga/Yoga.h' file not found** (React Native 0.79+ Yoga layout engine)
- Linker command failures with exit code 1
- libdav1d assembly compilation errors with C++ headers

**Podfile Fixes Applied:**
The Podfile includes several post-install fixes for React Native modules:
- Header search paths for RCTDeprecation and other RCT modules
- **Yoga header search paths** for React Native 0.79+ layout engine
- Swift include paths for proper module resolution
- Module map configuration for bridging headers
- Precompiled header optimization for React Native targets
- libdav1d assembly file isolation to prevent C++ header conflicts

**EAS Build Configuration:**
For EAS cloud builds, a prebuild hook (`scripts/eas-prebuild-ios.sh`) automatically cleans caches before building to prevent module map conflicts.

**Note**: The project uses `react-native-worklets` only for its Babel plugin. Native linking is disabled via `react-native.config.js` to prevent conflicts with `react-native-reanimated` v3's built-in worklets.

## 🎯 Game Controls

### Touch Controls
- **Tap Left/Right**: Move piece horizontally
- **Swipe Down**: Soft drop
- **Swipe Up**: Hard drop
- **Tap Rotate**: Rotate piece clockwise
- **Tap Hold**: Store current piece

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

The repository ships with a dedicated **Build and Sign** workflow at `.github/workflows/build-sign.yml`. Trigger it from the
**Actions** tab (workflow_dispatch) to produce signed Android and iOS release artifacts on demand.

### Required GitHub Secrets

| Platform | Secret | Purpose |
| --- | --- | --- |
| Android | `ANDROID_RELEASE_KEYSTORE_BASE64` | Base64-encoded release keystore (`base64 -w0 android.keystore`). |
| Android | `ANDROID_RELEASE_KEYSTORE_PASSWORD` | Password used to protect the keystore file. |
| Android | `ANDROID_RELEASE_KEY_ALIAS` | Alias of the signing key to use. |
| Android | `ANDROID_RELEASE_KEY_PASSWORD` | Password for the alias/private key. |
| iOS | `IOS_DISTRIBUTION_CERT_BASE64` | Base64-encoded `.p12` distribution certificate. |
| iOS | `IOS_DISTRIBUTION_CERT_PASSWORD` | Password that unlocks the `.p12` file. |
| iOS | `IOS_PROVISIONING_PROFILE_BASE64` | Base64-encoded distribution provisioning profile. |
| iOS | `IOS_KEYCHAIN_PASSWORD` | Temporary password for the runner keychain that stores the certificate. |
| iOS | `IOS_TEAM_ID` | Apple Developer Team ID used during codesign. |

> ℹ️ Keep secrets encoded on a single line (e.g., `base64 -b 0` on macOS) to avoid newline parsing issues in CI.

### Workflow Inputs

- **Platform**: Build Android, iOS, or both in a single run.
- **ios_export_method**: Controls the export method used by `xcodebuild` (`app-store`, `ad-hoc`, `enterprise`, or `development`).

Successful runs upload:

- `android-release` artifact containing the signed `.aab` and `.apk` bundles.
- `ios-release` artifact containing the signed `.ipa` and zipped dSYM symbols (when available).

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

