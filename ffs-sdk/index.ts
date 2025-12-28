/**
 * Flying Fox Solutions - Template Library
 *
 * Comprehensive barrel export system for the Flying Fox Template Library.
 * This provides clean, consistent import paths for all components, hooks, services, and types.
 */

// Import Tailwind CSS styles
import "./src/index.css";

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
