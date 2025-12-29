#!/usr/bin/env node
/**
 * Post-install script to ensure SDK is built
 * Only builds if dist folder is missing to avoid unnecessary rebuilds
 */

import { existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

// Try to find SDK in current directory first (for Netlify/GitHub), then parent (for local dev)
let sdkPath = "./ffs-sdk";
if (!existsSync(sdkPath)) {
  sdkPath = "../ffs-sdk";
  if (!existsSync(sdkPath)) {
    console.warn("⚠️  SDK not found in ./ffs-sdk or ../ffs-sdk, skipping SDK build check");
    process.exit(0);
  }
}

const distPath = join(sdkPath, "dist");
const sdkCssPath = join(distPath, "sdk.css");
const indexJsPath = join(distPath, "index", "index.es.js");

// Check if dist folder and critical files exist
if (!existsSync(distPath) || !existsSync(sdkCssPath) || !existsSync(indexJsPath)) {
  console.log("📦 SDK dist folder missing or incomplete, building SDK...");
  try {
    execSync("node build-sdk.js", { stdio: "inherit" });
    console.log("✅ SDK build complete");
  } catch (error) {
    console.warn("⚠️  SDK build failed, but continuing installation...");
    console.warn("   You may need to run 'npm run build:sdk' manually");
  }
} else {
  console.log("✅ SDK dist folder exists, skipping build");
}

