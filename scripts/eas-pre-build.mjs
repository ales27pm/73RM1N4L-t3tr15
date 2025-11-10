#!/usr/bin/env node
// Ensures the Android release keystore exists before production EAS builds run.
// Invoked via the global "pre-build" hook defined in eas.json.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const { EAS_BUILD_PROFILE, EAS_BUILD_PLATFORM } = process.env;

const profile = EAS_BUILD_PROFILE || "";
const platform = EAS_BUILD_PLATFORM || "";

if (platform !== "android" || profile !== "production") {
  console.info(
    `[eas-pre-build] Skipping Android keystore generation for profile "${profile}" on platform "${platform}".`,
  );
  process.exit(0);
}

const ensureScriptPath = resolve(fileURLToPath(new URL("./ensure-android-release-keystore.mjs", import.meta.url)));

console.info("[eas-pre-build] Ensuring Android release keystore before build.");

const child = spawn(process.execPath, [ensureScriptPath], { stdio: "inherit" });

child.on("error", (error) => {
  console.error("[eas-pre-build] Failed to launch keystore script:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  if (code === 0) {
    console.info("[eas-pre-build] Android keystore verification completed.");
  } else {
    console.error(`[eas-pre-build] Keystore script exited with status ${code}.`);
  }
  process.exitCode = code ?? 1;
});
