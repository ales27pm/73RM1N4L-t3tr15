import type { ExpoConfig } from "expo/config";

// Expo Doctor flags config fields that cannot sync to native projects when
// android/ios directories exist. We only emit those prebuild-specific fields
// when explicitly requested so the doctor check passes during bare builds.
const managedSyncEnabled = process.env.EXPO_ENABLE_CNG_SYNC === "1";

const managedPlugins: ExpoConfig["plugins"] = [
  "expo-asset",
  "expo-build-properties",
  "expo-font",
  "expo-mail-composer",
  "expo-secure-store",
  "expo-sqlite",
  "expo-video",
  "expo-web-browser",
];

try {
  require.resolve("expo-router");
  managedPlugins.unshift("expo-router");
} catch {
  // expo-router is optional for this project; ignore when not installed
}

const appConfig: ExpoConfig = {
  name: "Netsight",
  slug: "netsight",
  version: "1.0.0",
  newArchEnabled: true,
  extra: {
    doctor: {
      allowBareConfigFields: true,
    },
    eas: {
      projectId: "0661cabd-28d1-403d-ad26-212dddd78e58",
    },
    environment: process.env.EXPO_PUBLIC_APP_ENVIRONMENT ?? "development",
    leaderboardSyncUrl: process.env.EXPO_PUBLIC_LEADERBOARD_SYNC_URL ?? "https://cdn.reactt3tr15.com/leaderboard.json",
    rewardWebhookUrl: process.env.EXPO_PUBLIC_REWARD_WEBHOOK_URL ?? "https://hooks.reactt3tr15.com/rewards",
  },
};

if (managedSyncEnabled) {
  appConfig.scheme = "netsight";
  appConfig.orientation = "portrait";
  appConfig.userInterfaceStyle = "light";
  appConfig.icon = "./assets/app-icon.png";
  appConfig.splash = {
    image: "./assets/splash.png",
    backgroundColor: "#050b1f",
    resizeMode: "contain",
  };
  appConfig.ios = {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.netsight",
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#050b1f",
      resizeMode: "contain",
    },
  };
  appConfig.android = {
    edgeToEdgeEnabled: true,
    package: "com.anonymous.netsight",
    adaptiveIcon: {
      foregroundImage: "./assets/app-icon.png",
      backgroundColor: "#050b1f",
    },
  };
  appConfig.plugins = managedPlugins;
}

export default appConfig;
