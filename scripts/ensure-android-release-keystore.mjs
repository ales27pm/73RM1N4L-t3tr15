#!/usr/bin/env node
import { access, constants, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

const RELATIVE_KEYSTORE_PATH = "android/app/netsight-release-key.jks";
const keystorePath = resolve(RELATIVE_KEYSTORE_PATH);

const env = process.env;
const storePassword = env.ANDROID_KEYSTORE_PASSWORD || "NetsightRelease!23";
const keyAlias = env.ANDROID_KEY_ALIAS || "netsight";
const keyPassword = env.ANDROID_KEY_PASSWORD || storePassword;
const distinguishedName =
  env.ANDROID_KEYSTORE_DNAME || "CN=React T3TR15, OU=Security Research, O=Netsight, L=San Francisco, S=CA, C=US";

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
    return false;
  }
}

async function ensureDirectory(path) {
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });
}

function runKeytool(args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("keytool", args, { stdio: "inherit" });
    child.on("error", (error) => rejectPromise(error));
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`keytool exited with status ${code}`));
      }
    });
  });
}

async function main() {
  const alreadyExists = await fileExists(keystorePath);
  if (alreadyExists) {
    console.info(`Android release keystore already exists at ${keystorePath}`);
    return;
  }

  if (!storePassword || !keyAlias || !keyPassword) {
    console.error(
      "Missing keystore credentials. Ensure ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, and ANDROID_KEY_PASSWORD are set.",
    );
    process.exitCode = 1;
    return;
  }

  await ensureDirectory(keystorePath);

  const args = [
    "-genkeypair",
    "-v",
    "-keystore",
    keystorePath,
    "-storetype",
    "PKCS12",
    "-keyalg",
    "RSA",
    "-keysize",
    "2048",
    "-validity",
    "10000",
    "-alias",
    keyAlias,
    "-storepass",
    storePassword,
    "-keypass",
    keyPassword,
    "-dname",
    distinguishedName,
  ];

  console.info(`Generating Android release keystore at ${keystorePath}`);
  try {
    await runKeytool(args);
    console.info("Android release keystore generation completed.");
  } catch (error) {
    console.error("Failed to generate Android release keystore:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unexpected error while ensuring the Android keystore:", error);
  process.exitCode = 1;
});
