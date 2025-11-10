#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { EAS_BUILD_PROFILE = "", EAS_BUILD_PLATFORM = "" } = process.env;

if (EAS_BUILD_PLATFORM !== "android" || EAS_BUILD_PROFILE !== "production") {
  console.info(
    `[eas-pre-build] Skipping Android keystore generation for profile "${EAS_BUILD_PROFILE}" on platform "${EAS_BUILD_PLATFORM}".`,
  );
  process.exit(0);
}

const ensureScriptPath = resolve(fileURLToPath(new URL("./ensure-android-release-keystore.mjs", import.meta.url)));

async function assertEnsureScriptExists(path) {
  try {
    await access(path, fsConstants.F_OK);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      console.error(`[eas-pre-build] Keystore script not found at ${path}.`);
      process.exit(1);
      return;
    }

    console.error("[eas-pre-build] Failed to verify keystore script existence:", error);
    process.exit(1);
  }
}

async function main() {
  await assertEnsureScriptExists(ensureScriptPath);

  console.info("[eas-pre-build] Ensuring Android release keystore before build.");
  const result = spawnSync(process.execPath, [ensureScriptPath], { stdio: "inherit" });

  if (result.error) {
    console.error("[eas-pre-build] Failed to launch keystore script:", result.error);
    process.exit(1);
    return;
  }

  if (result.signal) {
    console.error(`[eas-pre-build] Keystore script terminated due to signal: ${result.signal}.`);
    process.exit(1);
    return;
  }

  if (result.status !== 0) {
    const exitCode = typeof result.status === "number" ? result.status : 1;
    console.error(`[eas-pre-build] Keystore script exited with status ${exitCode}.`);
    process.exit(exitCode);
    return;
  }

  console.info("[eas-pre-build] Android keystore verification completed.");
}

main().catch((error) => {
  console.error("[eas-pre-build] Unexpected error while preparing Android keystore:", error);
  process.exit(1);
});
