#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "ios", "certs");
const certificatePath = path.join(outputDir, "netsight-distribution-cert.p12");
const provisioningProfilePath = path.join(outputDir, "netsight-production-profile.mobileprovision");

const env = process.env;
const certificateBase64 = env.IOS_DISTRIBUTION_CERT_BASE64 || env.IOS_DIST_CERT_BASE64;
const provisioningProfileBase64 = env.IOS_PROVISIONING_PROFILE_BASE64 || env.IOS_DIST_PROVISIONING_PROFILE_BASE64;
const teamIdFromEnv = env.IOS_APPLE_TEAM_ID || env.APPLE_TEAM_ID || "";

const credentialsPath = path.join(projectRoot, "credentials.json");

class MissingCredentialError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = "MissingCredentialError";
    this.kind = kind;
  }
}

if (env.IOS_DISTRIBUTION_CERT_PASSWORD || env.IOS_DIST_CERT_PASSWORD) {
  console.warn(
    "IOS_DISTRIBUTION_CERT_PASSWORD is defined but will be ignored because the certificate must be exported without a password.",
  );
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function decodeBase64(value, label) {
  try {
    return Buffer.from(value, "base64");
  } catch (error) {
    throw new Error(`Failed to decode ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function writeFileIfChanged(filePath, contents) {
  const exists = await fileExists(filePath);
  if (exists) {
    const current = await fs.readFile(filePath);
    if (Buffer.compare(current, contents) === 0) {
      return false;
    }
  }

  await fs.writeFile(filePath, contents, { mode: 0o600 });
  return true;
}

async function ensureCertificate() {
  const exists = await fileExists(certificatePath);

  if (!certificateBase64) {
    if (exists) {
      console.info(`iOS distribution certificate already present at ${certificatePath}`);
      return null;
    }

    return new MissingCredentialError(
      "distribution_certificate",
      `Missing IOS_DISTRIBUTION_CERT_BASE64 environment variable and certificate file is absent. ` +
        `Upload your distribution certificate to ${certificatePath} or expose the base64 string via the environment.`,
    );
  }

  const buffer = decodeBase64(certificateBase64, "IOS_DISTRIBUTION_CERT_BASE64");
  await ensureDirectory(outputDir);
  const updated = await writeFileIfChanged(certificatePath, buffer);

  if (updated) {
    console.info(`Wrote iOS distribution certificate to ${certificatePath}`);
  } else {
    console.info(`iOS distribution certificate at ${certificatePath} is up to date`);
  }

  return null;
}

async function ensureProvisioningProfile() {
  const exists = await fileExists(provisioningProfilePath);

  if (!provisioningProfileBase64) {
    if (exists) {
      console.info(`iOS provisioning profile already present at ${provisioningProfilePath}`);
      return null;
    }

    return new MissingCredentialError(
      "provisioning_profile",
      `Missing IOS_PROVISIONING_PROFILE_BASE64 environment variable and provisioning profile file is absent. ` +
        `Upload your provisioning profile to ${provisioningProfilePath} or expose the base64 string via the environment.`,
    );
  }

  const buffer = decodeBase64(provisioningProfileBase64, "IOS_PROVISIONING_PROFILE_BASE64");
  await ensureDirectory(outputDir);
  const updated = await writeFileIfChanged(provisioningProfilePath, buffer);

  if (updated) {
    console.info(`Wrote iOS provisioning profile to ${provisioningProfilePath}`);
  } else {
    console.info(`iOS provisioning profile at ${provisioningProfilePath} is up to date`);
  }

  return null;
}

async function readCredentials() {
  try {
    const raw = await fs.readFile(credentialsPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Unable to read credentials.json at ${credentialsPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function writeCredentials(data) {
  const serialized = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(credentialsPath, serialized);
}

async function ensureTeamId() {
  const credentials = await readCredentials();
  const iosCredentials = credentials.ios ?? (credentials.ios = {});
  const existingTeamId = typeof iosCredentials.teamId === "string" ? iosCredentials.teamId.trim() : "";

  if (!teamIdFromEnv && !existingTeamId) {
    return new MissingCredentialError(
      "team_id",
      "Missing IOS_APPLE_TEAM_ID environment variable and ios.teamId is absent from credentials.json. " +
        "Provide the Apple Developer Team ID via IOS_APPLE_TEAM_ID or add it to credentials.json.",
    );
  }

  if (!teamIdFromEnv) {
    console.info(`Using existing Apple Team ID '${existingTeamId}' from credentials.json.`);
    return null;
  }

  if (existingTeamId === teamIdFromEnv) {
    return null;
  }

  iosCredentials.teamId = teamIdFromEnv;
  await writeCredentials(credentials);
  console.info(`Updated Apple Team ID in credentials.json to '${teamIdFromEnv}'.`);
  return null;
}

async function main() {
  try {
    const missing = [];

    const [certificateResult, profileResult] = await Promise.all([ensureCertificate(), ensureProvisioningProfile()]);
    if (certificateResult instanceof MissingCredentialError) {
      missing.push(certificateResult);
    }
    if (profileResult instanceof MissingCredentialError) {
      missing.push(profileResult);
    }

    const teamIdResult = await ensureTeamId();
    if (teamIdResult instanceof MissingCredentialError) {
      missing.push(teamIdResult);
    }

    if (missing.length > 0) {
      for (const error of missing) {
        console.error(error.message);
      }
      process.exitCode = 2;
      return;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unexpected error while preparing iOS credentials");
    }
    process.exit(1);
  }
}

main();
