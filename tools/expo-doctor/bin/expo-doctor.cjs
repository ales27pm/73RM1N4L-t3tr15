#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const registerPath = path.resolve(__dirname, "../register.cjs");
const cliPath = require.resolve("expo-doctor-upstream/build/index.js");
const existingNodeOptions = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : "";
const nodeOptions = `${existingNodeOptions}--require ${registerPath}`.trim();

const env = {
  ...process.env,
  NODE_OPTIONS: nodeOptions,
  EXPO_OFFLINE: process.env.EXPO_OFFLINE ?? "1",
};

if (!fs.existsSync(registerPath)) {
  console.error(`expo-doctor wrapper missing register script at ${registerPath}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 0);
