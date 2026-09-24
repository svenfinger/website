import tsParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";

export default [
  {
    ignores: ["dist/", ".astro/"],
  },
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
];
