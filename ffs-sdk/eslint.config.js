import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
  // Global ignores
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "build/**",
      "*.config.js",
      "*.config.ts",
    ],
  },

  // Base configuration for all TypeScript and TSX files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Extend recommended configurations
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Custom rules for the SDK - more lenient for SDK development
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "react-refresh/only-export-components": "off", // Not relevant for SDK

      // Relax some rules for SDK development
      "no-undef": "off", // TypeScript handles this better
      "no-redeclare": "off", // TypeScript handles this
      "@typescript-eslint/no-redeclare": "warn",

      // Import and formatting rules
      "no-console": "off", // Allow console.log in SDK for debugging
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
    },
  },

  // Specific rules for test files
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/test-consumer/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
];
