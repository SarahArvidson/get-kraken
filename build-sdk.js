#!/usr/bin/env node
/**
 * Cross-platform SDK build script
 * Builds the SDK library and types, continuing even if type generation fails
 */

import { execSync } from "child_process";
import { chdir, cwd } from "process";
import { existsSync } from "fs";
import { join, resolve } from "path";

// Save the original working directory
const originalCwd = cwd();

// Try to find SDK in current directory first (for Netlify/GitHub), then parent (for local dev)
let sdkPath = "./ffs-sdk";
if (!existsSync(sdkPath)) {
  sdkPath = "../ffs-sdk";
  if (!existsSync(sdkPath)) {
    throw new Error("SDK not found in ./ffs-sdk or ../ffs-sdk");
  }
}

// Resolve to absolute path
const absoluteSdkPath = resolve(sdkPath);

try {
  chdir(absoluteSdkPath);
  
  console.log("Installing SDK dependencies...");
  execSync("npm install --prefer-offline --no-audit", { stdio: "inherit" });
  
  console.log("Building SDK library...");
  execSync("npm run build:lib", { stdio: "inherit" });
  
  console.log("Generating SDK types...");
  try {
    // Run type generation with a timeout to prevent hanging
    execSync("npm run build:types", { 
      stdio: "inherit",
      timeout: 60000, // 60 second timeout
      killSignal: "SIGTERM"
    });
    console.log("✅ Type generation complete");
  } catch (error) {
    if (error.signal === "SIGTERM") {
      console.warn("⚠️  Type generation timed out, but continuing build...");
    } else {
      console.warn("⚠️  Type generation had errors, but continuing build...");
    }
    // Type errors in SDK don't block the build
  }
  
  console.log("✅ SDK build complete");
} catch (error) {
  console.error("❌ SDK build failed:", error.message);
  process.exit(1);
} finally {
  // Always return to the original directory
  chdir(originalCwd);
}

