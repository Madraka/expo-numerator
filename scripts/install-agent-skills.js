#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const skillFiles = [
  "skills/README.md",
  "skills/common/expo-numerator/SKILL.md",
  "skills/consumer/expo-numerator-consumer/SKILL.md",
  "skills/maintainer/expo-numerator-maintainer/SKILL.md",
  "skills/maintainer/expo-numerator-core/SKILL.md",
  "skills/maintainer/expo-numerator-money-input/SKILL.md",
  "skills/maintainer/expo-numerator-locale-format-parse/SKILL.md",
  "skills/maintainer/expo-numerator-unit/SKILL.md",
  "skills/maintainer/expo-numerator-phone/SKILL.md",
  "skills/maintainer/expo-numerator-expo-example/SKILL.md",
  "skills/maintainer/expo-numerator-package-release/SKILL.md",
];

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const failures = checkSourceFiles();

  if (failures.length > 0) {
    console.error(`Agent skill install failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  if (options.target === "codex" || options.target === "all") {
    installCodex(options);
  }

  if (options.target === "claude" || options.target === "all") {
    installClaude(options);
  }
}

function parseArgs(args) {
  const options = {
    target: "all",
    dryRun: false,
    destination: "",
    help: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length);
    } else if (arg.startsWith("--destination=")) {
      options.destination = path.resolve(arg.slice("--destination=".length));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["all", "codex", "claude"].includes(options.target)) {
    throw new Error(`Unsupported target: ${options.target}`);
  }

  return options;
}

function installCodex(options) {
  const destination = options.destination || path.join(getCodexHome(), "skills", "expo-numerator");
  const entry = buildCodexSkillEntry(destination);

  if (options.dryRun) {
    console.log(`[dry-run] Codex skill would install to ${destination}`);
    console.log(`[dry-run] Codex skill would include ${skillFiles.length} source files.`);
    return;
  }

  fs.rmSync(destination, { force: true, recursive: true });
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, "SKILL.md"), entry);

  for (const file of skillFiles) {
    copyFile(file, path.join(destination, "project", file));
  }

  console.log(`Codex skill installed to ${destination}`);
}

function installClaude(options) {
  const requiredClaudeFiles = ["CLAUDE.md", "skills/README.md", ...skillFiles];
  const missing = requiredClaudeFiles.filter((file) => !fs.existsSync(path.join(repoRoot, file)));

  if (missing.length > 0) {
    throw new Error(`Claude setup is missing files: ${missing.join(", ")}`);
  }

  if (options.dryRun) {
    console.log("[dry-run] Claude setup is repo-local and ready.");
    console.log("[dry-run] Start Claude from the repository root so CLAUDE.md is loaded.");
    return;
  }

  console.log("Claude setup is repo-local and ready.");
  console.log("Start Claude from this repository root so CLAUDE.md is loaded.");
}

function buildCodexSkillEntry(destination) {
  return `# expo-numerator\n\n` +
    `## When To Use\n\n` +
    `Use this skill when working on or integrating the expo-numerator package.\n\n` +
    `## Installed From\n\n` +
    `- Source repo: ${repoRoot}\n` +
    `- Install path: ${destination}\n\n` +
    `## Read Order\n\n` +
    `1. project/skills/README.md\n` +
    `2. project/skills/common/expo-numerator/SKILL.md\n` +
    `3. Consumer work: project/skills/consumer/expo-numerator-consumer/SKILL.md\n` +
    `4. Maintainer work: project/skills/maintainer/expo-numerator-maintainer/SKILL.md\n` +
    `5. Maintainer domain skill under project/skills/maintainer/ when editing source, tests, example, CI, package, or release behavior.\n\n` +
    `## Verification\n\n` +
    `Run from the source repo:\n\n` +
    "```sh\n" +
    "npm run skills:check\n" +
    "```\n";
}

function checkSourceFiles() {
  return ["AGENTS.md", "CLAUDE.md", ...skillFiles]
    .filter((file) => !fs.existsSync(path.join(repoRoot, file)))
    .map((file) => `missing source file: ${file}`);
}

function copyFile(sourceRelative, destination) {
  const source = path.join(repoRoot, sourceRelative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function getCodexHome() {
  return process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
}

function printHelp() {
  console.log(`Usage: node scripts/install-agent-skills.js [options]\n\n` +
    `Options:\n` +
    `  --target=all|codex|claude   Install or verify target setup. Default: all\n` +
    `  --destination=<path>         Codex install destination override.\n` +
    `  --dry-run                    Print actions without writing files.\n` +
    `  --help                       Show this help.\n`);
}

main();
