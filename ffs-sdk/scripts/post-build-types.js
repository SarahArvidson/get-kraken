#!/usr/bin/env node

/**
 * Post-build script to ensure root index.d.ts exists
 *
 * TypeScript doesn't generate index.d.ts for the main index.ts because it contains CSS imports.
 * This script creates the necessary root declaration file.
 */

import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const distPath = "./dist";
const indexDtsPath = join(distPath, "index.d.ts");

// Only create if it doesn't exist (to avoid overwriting during development)
if (!existsSync(indexDtsPath)) {
  const content = `/**
 * Flying Fox Solutions - Template Library
 *
 * Comprehensive barrel export system for the Flying Fox Template Library.
 * This provides clean, consistent import paths for all components, hooks, services, and types.
 */

// ============================================================================
// 🧱 Atomic Components
// ============================================================================

export * as components from "./components";

// ============================================================================
// 🧪 Hooks
// ============================================================================

export * as hooks from "./hooks";

// ============================================================================
// 🧰 Blueprints
// ============================================================================

export * as blueprints from "./components/blueprints";

// ============================================================================
// 🧵 Services
// ============================================================================

export * as services from "./services";

// ============================================================================
// 🧾 Types
// ============================================================================

export * as types from "./types";

// ============================================================================
// 🎯 Convenience Re-exports
// ============================================================================

// For direct imports without namespace (e.g., import { Button } from "@ffx/sdk")
export * from "./components";
export * from "./hooks";
export * from "./components/blueprints";
export * from "./services";
export * from "./types";
`;

  writeFileSync(indexDtsPath, content, "utf8");
  console.log("✅ Created root index.d.ts file");
} else {
  console.log("✅ Root index.d.ts file already exists");
}

