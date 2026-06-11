import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tokensDir = join(root, "src/tokens");
const outputPath = join(root, "src/styles/tokens.css");

const lightSemantics = JSON.parse(
  readFileSync(join(tokensDir, "semantics/light.json"), "utf8"),
);
const darkSemantics = JSON.parse(
  readFileSync(join(tokensDir, "semantics/dark.json"), "utf8"),
);

function toKebabCase(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

/** Map Figma primitive aliases to Tailwind's built-in theme variables. */
function figmaAliasToTailwindVar(alias) {
  const [, group, ...rest] = alias.split("/");

  if (group === "Basic") {
    return `--color-${toKebabCase(rest[0])}`;
  }

  return `--color-${toKebabCase(group)}-${rest.join("-").toLowerCase()}`;
}

function semanticCssVar(segments) {
  const [, ...rest] = segments;
  return `--semantic-${rest.map(toKebabCase).join("-")}`;
}

function resolveSemanticValue(token) {
  const alias = token.$extensions?.["com.figma.aliasData"]?.targetVariableName;
  if (alias) return `var(${figmaAliasToTailwindVar(alias)})`;
  if (token.$type === "color") return token.$value.hex;
  return String(token.$value);
}

function walkSemanticTokens(node, path = [], results = []) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;

    const nextPath = [...path, key];

    if (value?.$type) {
      results.push({
        cssVar: semanticCssVar(nextPath),
        token: value,
      });
      continue;
    }

    if (value && typeof value === "object") {
      walkSemanticTokens(value, nextPath, results);
    }
  }

  return results;
}

function formatBlock(selector, vars) {
  const lines = Object.entries(vars)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `\t${name}: ${value};`);

  return `${selector} {\n${lines.join("\n")}\n}`;
}

function semanticVars(tokens) {
  return Object.fromEntries(
    tokens.map(({ cssVar, token }) => [cssVar, resolveSemanticValue(token)]),
  );
}

function themeUtilityName(cssVar) {
  return cssVar.replace(/^--semantic-/, "");
}

const lightTokens = walkSemanticTokens(lightSemantics);
const darkTokens = walkSemanticTokens(darkSemantics);
const lightSemanticVars = semanticVars(lightTokens);
const darkSemanticVars = semanticVars(darkTokens);

const themeEntries = lightTokens.map(({ cssVar }) => [
  themeUtilityName(cssVar),
  `var(${cssVar})`,
]);

const css = `/* Generated from Figma semantic tokens — run \`pnpm generate-tokens\` after updating src/tokens/semantics/ */
/* Primitives live in Tailwind defaults; see src/tokens/primitives.json for the Figma reference export. */

@theme inline {
${themeEntries.map(([name, value]) => `\t--color-${name}: ${value};`).join("\n")}
}

${formatBlock(":root", lightSemanticVars)}

@media (prefers-color-scheme: dark) {
${formatBlock("\t:root", darkSemanticVars)}
}
`;

writeFileSync(outputPath, css);

console.log(`Wrote ${outputPath}`);
console.log(`  ${lightTokens.length} semantic tokens`);
