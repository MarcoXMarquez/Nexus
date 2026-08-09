import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "dist/**",
    "desktop-dist/**",
    "out/**",
    "build/**",
    "work/**",
    "public/**",
    "proptoopips/**",
    "next-env.d.ts",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  next.configs["core-web-vitals"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["desktop/renderer.tsx"],
    rules: {
      // The established canvas-style app intentionally uses native images and
      // event-driven state hydration. Keeping it canonical avoids two divergent UIs.
      "@next/next/no-img-element": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "jsx-a11y/no-autofocus": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "no-empty": "off",
      "prefer-const": "off",
      "react/jsx-no-comment-textnodes": "off",
    },
  },
  {
    files: ["desktop/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["desktop/**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["app/marathon/**/*.tsx", "app/features/friends/**/*.tsx"],
    rules: {
      // Posters are already generated static assets; Next image transforms would
      // consume Vercel quota without improving these pre-sized files.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
