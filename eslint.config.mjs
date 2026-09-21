import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent tooling, not project source: gitignored, ships its own CommonJS
    // scripts, and linting it buries real findings under hundreds of
    // no-require-imports errors we would never act on.
    ".claude/**",
    ".agents/**",
  ]),
]);

export default eslintConfig;
