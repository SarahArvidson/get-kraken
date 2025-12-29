#!/usr/bin/env node
/**
 * Cross-platform SDK build script
 * Builds the SDK library and types, continuing even if type generation fails
 */

import { execSync } from "child_process";
import { chdir } from "process";
import { existsSync } from "fs";
import { join } from "path";

// Try to find SDK in current directory first (for Netlify/GitHub), then parent (for local dev)
let sdkPath = "./ffs-sdk";
if (!existsSync(sdkPath)) {
  sdkPath = "../ffs-sdk";
  if (!existsSync(sdkPath)) {
    throw new Error("SDK not found in ./ffs-sdk or ../ffs-sdk");
  }
}

try {
  chdir(sdkPath);
  
  console.log("Installing SDK dependencies...");
  execSync("npm install --prefer-offline --no-audit", { stdio: "inherit" });
  
  console.log("Building SDK library...");
  execSync("npm run build:lib", { stdio: "inherit" });
  
  console.log("Generating SDK types...");
  try {
    execSync("npm run build:types", { stdio: "inherit" });
  } catch (error) {
    console.warn("⚠️  Type generation had errors, but continuing build...");
    // Type errors in SDK don't block the build
  }
  
  console.log("✅ SDK build complete");
} catch (error) {
  console.error("❌ SDK build failed:", error.message);
  process.exit(1);
}

