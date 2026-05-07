#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const repoRoot = path.resolve(__dirname, "..");
const buildRoot = path.join(repoRoot, "build");
const sourceRoot = path.join(repoRoot, "src");
const esmRoot = path.join(buildRoot, "esm");
const cjsRoot = path.join(buildRoot, "cjs");

function main() {
  if (!fs.existsSync(buildRoot)) {
    console.error("Build output is missing. Run `expo-module build` first.");
    process.exit(1);
  }

  fs.rmSync(esmRoot, { force: true, recursive: true });
  fs.rmSync(cjsRoot, { force: true, recursive: true });
  fs.rmSync(path.join(buildRoot, "src"), { force: true, recursive: true });
  buildEsmTree();
  buildCjsTree();
}

function buildEsmTree() {
  for (const filePath of walk(buildRoot)) {
    if (filePath.includes(`${path.sep}esm${path.sep}`)) {
      continue;
    }

    if (filePath.includes(`${path.sep}cjs${path.sep}`)) {
      continue;
    }

    if (!filePath.endsWith(".js")) {
      continue;
    }

    const relativePath = path.relative(buildRoot, filePath);
    const outputPath = path
      .join(esmRoot, relativePath)
      .replace(/\.js$/, ".mjs");
    const source = fs.readFileSync(filePath, "utf8");
    const output = rewriteEsmSpecifiers(source);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);
  }
}

function buildCjsTree() {
  for (const sourcePath of walk(sourceRoot)) {
    if (!/\.(ts|tsx)$/.test(sourcePath) || sourcePath.includes("__tests__")) {
      continue;
    }

    const relativePath = path.relative(sourceRoot, sourcePath);
    const outputPath = path
      .join(cjsRoot, relativePath)
      .replace(/\.(ts|tsx)$/, ".cjs");
    const source = fs.readFileSync(sourcePath, "utf8");
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: sourcePath,
    }).outputText;
    const output = rewriteCjsSpecifiers(transpiled);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);
  }
}

function rewriteEsmSpecifiers(source) {
  return source
    .replace(/(from\s+["'])(\.[^"']+)(["'])/g, (match, prefix, specifier, suffix) => {
      return `${prefix}${appendMjs(specifier)}${suffix}`;
    })
    .replace(/(import\s*\(\s*["'])(\.[^"']+)(["']\s*\))/g, (match, prefix, specifier, suffix) => {
      return `${prefix}${appendMjs(specifier)}${suffix}`;
    });
}

function rewriteCjsSpecifiers(source) {
  return source.replace(
    /(require\s*\(\s*["'])(\.[^"']+)(["']\s*\))/g,
    (match, prefix, specifier, suffix) => {
      return `${prefix}${appendCjs(specifier)}${suffix}`;
    },
  );
}

function appendMjs(specifier) {
  return hasKnownExtension(specifier) ? specifier : `${specifier}.mjs`;
}

function appendCjs(specifier) {
  return hasKnownExtension(specifier) ? specifier : `${specifier}.cjs`;
}

function hasKnownExtension(specifier) {
  return /\.[cm]?js$|\.json$/.test(specifier);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

main();
