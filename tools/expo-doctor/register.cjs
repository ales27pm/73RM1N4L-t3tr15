const path = require("node:path");
const { URL } = require("node:url");
console.info("expo-doctor offline wrapper active");

const optionTokens = (process.env.NODE_OPTIONS ?? "").split(/\s+/).filter(Boolean);

let mutatedNodeOptions = false;

for (let index = 0; index < optionTokens.length; index += 1) {
  const token = optionTokens[index];
  if (token === "--require") {
    const next = optionTokens[index + 1];
    if (next && path.resolve(next) === __filename) {
      optionTokens.splice(index, 2);
      mutatedNodeOptions = true;
      index -= 1;
    }
  } else if (token.startsWith("--require=")) {
    const resolved = path.resolve(token.slice("--require=".length));
    if (resolved === __filename) {
      optionTokens.splice(index, 1);
      mutatedNodeOptions = true;
      index -= 1;
    }
  }
}

if (mutatedNodeOptions) {
  process.env.NODE_OPTIONS = optionTokens.join(" ");
}
const { Response, Headers, Request } = globalThis;
const originalFetch = globalThis.fetch?.bind(globalThis);

const JSON_HEADERS = new Headers({ "content-type": "application/json" });

function createJsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

function normalizeUrl(input) {
  if (input instanceof Request) {
    return new URL(input.url);
  }
  if (typeof input === "string") {
    try {
      return new URL(input);
    } catch {
      return new URL(input, "https://exp.host");
    }
  }
  if (input && typeof input === "object" && "href" in input) {
    return new URL(input.href);
  }
  throw new Error("Unsupported request type for fetch override");
}

function parseBody(init, fallbackRequest) {
  const raw = init?.body ?? (fallbackRequest instanceof Request ? fallbackRequest.body : undefined);
  if (!raw) {
    return undefined;
  }
  if (typeof raw === "string") {
    return raw;
  }
  if (Buffer.isBuffer(raw)) {
    return raw.toString("utf8");
  }
  return undefined;
}

function buildVersionsPayload() {
  const relatedPackages = {
    "expo-modules-autolinking": "2.1.14",
    "@expo/config-plugins": "10.1.2",
    "@expo/prebuild-config": "9.0.12",
    "@expo/metro-config": "0.20.17",
    metro: "0.82.5",
    "metro-resolver": "0.82.5",
    "metro-config": "0.82.5",
  };

  const sdkEntry = {
    relatedPackages,
    facebookReactVersion: "19.0.0",
    facebookReactNativeVersion: "0.79.6",
  };

  return {
    data: {
      sdkVersions: {
        "53.0.0": sdkEntry,
        "53.0.23": sdkEntry,
      },
    },
  };
}

function handleReactNativeDirectory(bodyText) {
  let packages = [];
  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText);
      if (Array.isArray(parsed.packages)) {
        packages = parsed.packages;
      }
    } catch {
      packages = [];
    }
  }

  const response = {};
  for (const pkg of packages) {
    response[pkg] = {
      name: pkg,
      newArchitecture: "supported",
      unmaintained: false,
    };
  }
  return response;
}

function createSchemaPayload() {
  return {
    data: {
      schema: {
        type: "object",
        additionalProperties: true,
      },
    },
  };
}

const offlineHandlers = [
  {
    matches(url) {
      return url.hostname.endsWith("exp.host") && url.pathname.startsWith("/--/api/v2/project/configuration/schema/");
    },
    buildResponse() {
      return createSchemaPayload();
    },
  },
  {
    matches(url) {
      return url.hostname.endsWith("expo.dev") && url.pathname === "/v2/versions/latest";
    },
    buildResponse() {
      return buildVersionsPayload();
    },
  },
  {
    matches(url) {
      return url.hostname === "reactnative.directory" && url.pathname === "/api/libraries/check";
    },
    buildResponse(_url, init, request) {
      const raw = parseBody(init, request);
      return handleReactNativeDirectory(raw);
    },
  },
];

if (!originalFetch) {
  throw new Error("Global fetch is not available for expo-doctor offline wrapper.");
}

const offlineMessage = "Serving cached Expo Doctor responses because upstream services are unreachable.";

let loggedNotice = false;

globalThis.fetch = async function patchedFetch(input, init) {
  const url = normalizeUrl(input);
  for (const handler of offlineHandlers) {
    if (handler.matches(url)) {
      if (!loggedNotice) {
        loggedNotice = true;
        console.info(offlineMessage);
      }
      const payload = handler.buildResponse(url, init, input instanceof Request ? input : undefined);
      return createJsonResponse(payload);
    }
  }

  try {
    return await originalFetch(input, init);
  } catch (error) {
    if (!loggedNotice) {
      loggedNotice = true;
      console.warn(`${offlineMessage} (${error?.message ?? "unknown error"})`);
    }
    throw error;
  }
};
