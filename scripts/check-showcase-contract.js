#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const routesFile = path.join(repoRoot, "example/src/showcase/routes.ts");
const layoutFile = path.join(repoRoot, "example/app/_layout.tsx");
const componentsFile = path.join(repoRoot, "example/src/showcase/components.tsx");
const currencyPageFile = path.join(
  repoRoot,
  "example/src/showcase/pages/currency-page.tsx",
);
const inputPageFile = path.join(
  repoRoot,
  "example/src/showcase/pages/input-page.tsx",
);
const phonePageFile = path.join(
  repoRoot,
  "example/src/showcase/pages/phone-page.tsx",
);
const phoneCountryPickerSheetFile = path.join(
  repoRoot,
  "example/src/showcase/pages/phone-country-picker-sheet.tsx",
);
const unitsPageFile = path.join(
  repoRoot,
  "example/src/showcase/pages/units-page.tsx",
);
const inputAcceptanceFile = path.join(repoRoot, "docs/INPUT_ACCEPTANCE.md");

const additionalSelectors = [
  {
    sourceFile: inputPageFile,
    selectors: [
      "expo-numerator-lifecycle-input",
      "expo-numerator-percent-input",
      "expo-numerator-unit-input",
      "expo-numerator-integer-input",
      "expo-numerator-amount-input",
      "expo-numerator-amount-parsed",
      "expo-numerator-amount-state",
    ],
    template: "expo-numerator-${props.id}-input",
    templateIds: ["lifecycle", "percent", "unit", "integer"],
  },
  {
    sourceFile: currencyPageFile,
    selectors: [
      "expo-numerator-currency-search",
      "expo-numerator-currency-filter-all",
      "expo-numerator-currency-filter-zero",
      "expo-numerator-currency-filter-three",
      "expo-numerator-currency-filter-four",
    ],
    template: "expo-numerator-currency-filter-${item.id}",
    templateIds: ["all", "zero", "three", "four"],
  },
  {
    sourceFiles: [phonePageFile, phoneCountryPickerSheetFile],
    selectors: [
      "expo-numerator-phone-input",
      "expo-numerator-phone-parsed",
      "expo-numerator-phone-state",
      "expo-numerator-phone-otp-input",
      "expo-numerator-phone-otp-start",
      "expo-numerator-phone-otp-submit",
      "expo-numerator-phone-otp-resend",
      "expo-numerator-phone-otp-state",
      "expo-numerator-phone-otp-request",
      "expo-numerator-phone-otp-check-request",
      "expo-numerator-phone-otp-resend-request",
      "expo-numerator-phone-otp-provider-contract",
      "expo-numerator-phone-profile-switch",
      "expo-numerator-phone-profile-max",
      "expo-numerator-phone-asyoutype",
      "expo-numerator-phone-type-table",
      "expo-numerator-phone-country-open",
      "expo-numerator-phone-country-sheet",
      "expo-numerator-phone-country-search",
      "expo-numerator-phone-country-picker",
      "expo-numerator-phone-country-preview-TR",
    ],
    template: "expo-numerator-phone-country-preview-${country.region}",
    templateIds: ["TR"],
  },
];

function main() {
  const routesSource = read(routesFile);
  const routes = extractRoutes(routesSource);
  const failures = [];

  if (routes.length === 0) {
    failures.push("No showcase routes were found in example/src/showcase/routes.ts.");
  }

  assertUnique(routes, "href", failures);
  assertUnique(routes, "id", failures);
  assertRouteFiles(routes, failures);
  assertLayoutScreens(routes, failures);
  assertPhoneCountryPickerSheet(failures);
  assertScreenSelectors(routes, failures);
  assertInputAcceptanceDocs(routes, failures);
  assertAdditionalSelectors(failures);
  assertUnitsPageSafeParse(failures);

  if (failures.length > 0) {
    console.error(`Showcase contract failed:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`Showcase contract passed (${routes.length} routes).`);
}

function extractRoutes(source) {
  const routes = [];
  const routePattern =
    /\{\s*href:\s*"([^"]+)",\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*caption:\s*"([^"]+)"/g;
  let match;

  while ((match = routePattern.exec(source)) !== null) {
    routes.push({
      href: match[1],
      id: match[2],
      title: match[3],
      caption: match[4],
    });
  }

  return routes;
}

function assertUnique(items, key, failures) {
  const seen = new Set();

  for (const item of items) {
    if (seen.has(item[key])) {
      failures.push(`Duplicate showcase ${key}: ${item[key]}`);
    }

    seen.add(item[key]);
  }
}

function assertRouteFiles(routes, failures) {
  for (const route of routes) {
    const routeName = getRouteName(route);
    const routeFile = path.join(repoRoot, `example/app/${routeName}.tsx`);
    const pageFile = path.join(
      repoRoot,
      `example/src/showcase/pages/${route.id}-page.tsx`,
    );

    if (!fs.existsSync(routeFile)) {
      failures.push(`Missing Expo Router file for ${route.href}: ${relative(routeFile)}`);
    }

    if (!fs.existsSync(pageFile)) {
      failures.push(`Missing showcase page for ${route.id}: ${relative(pageFile)}`);
    }

    if (route.id !== "overview" && fs.existsSync(pageFile)) {
      const pageSource = read(pageFile);

      if (!pageSource.includes(`pageId="${route.id}"`)) {
        failures.push(`Missing screen pageId for ${route.id}: ${relative(pageFile)}`);
      }
    }
  }
}

function assertLayoutScreens(routes, failures) {
  const layoutSource = read(layoutFile);

  for (const route of routes) {
    const routeName = getRouteName(route);

    if (!layoutSource.includes(`<Stack.Screen name="${routeName}"`)) {
      failures.push(`Missing Stack.Screen for ${route.href}.`);
    }
  }
}

function assertPhoneCountryPickerSheet(failures) {
  const layoutSource = read(layoutFile);
  const routeFile = path.join(repoRoot, "example/app/phone-country-picker.tsx");

  if (!fs.existsSync(routeFile)) {
    failures.push("Missing Expo Router file for phone country picker sheet.");
  }

  if (!fs.existsSync(phoneCountryPickerSheetFile)) {
    failures.push("Missing phone country picker sheet implementation.");
  }

  if (!/<Stack\.Screen\s+name="phone-country-picker"/.test(layoutSource)) {
    failures.push("Missing Stack.Screen for phone country picker sheet.");
  }

  if (!layoutSource.includes('presentation: "formSheet"')) {
    failures.push("Phone country picker must use Expo Router formSheet.");
  }
}

function assertScreenSelectors(routes, failures) {
  const componentsSource = read(componentsFile);

  if (!componentsSource.includes("expo-numerator-screen-overview")) {
    failures.push("Missing overview screen selector in HomeScaffold.");
  }

  if (!componentsSource.includes("expo-numerator-screen-${props.pageId}")) {
    failures.push("Missing PageScaffold screen selector template.");
  }

  if (!componentsSource.includes("expo-numerator-page-${page.id}")) {
    failures.push("Missing route navigation selector template.");
  }

  for (const route of routes) {
    const pageFile = path.join(
      repoRoot,
      `example/src/showcase/pages/${route.id}-page.tsx`,
    );

    if (route.id === "overview" || !fs.existsSync(pageFile)) {
      continue;
    }

    const pageSource = read(pageFile);

    if (!pageSource.includes(`pageId="${route.id}"`)) {
      failures.push(`Missing screen selector input for ${route.id}.`);
    }
  }
}

function assertInputAcceptanceDocs(routes, failures) {
  const docs = read(inputAcceptanceFile);

  for (const route of routes) {
    for (const expected of [
      `- \`${route.href}\``,
      `- \`expo-numerator-page-${route.id}\``,
      `- \`expo-numerator-screen-${route.id}\``,
    ]) {
      if (!docs.includes(expected)) {
        failures.push(`Missing INPUT_ACCEPTANCE entry: ${expected}`);
      }
    }
  }
}

function assertAdditionalSelectors(failures) {
  const docs = read(inputAcceptanceFile);

  for (const group of additionalSelectors) {
    const sources = (group.sourceFiles ?? [group.sourceFile]).map(read);

    for (const selector of group.selectors) {
      if (!docs.includes(`- \`${selector}\``)) {
        failures.push(`Missing INPUT_ACCEPTANCE selector entry: ${selector}`);
      }

      if (!sources.some((source) => selectorExistsInSource(selector, source, group))) {
        failures.push(
          `Selector is documented but not produced by showcase sources: ${selector}`,
        );
      }
    }
  }
}

function assertUnitsPageSafeParse(failures) {
  const source = read(unitsPageFile);

  if (/\bparseUnit\(/.test(source)) {
    failures.push(
      "Units showcase must use safeParseUnit for rendered parse demos.",
    );
  }
}

function selectorExistsInSource(selector, source, group) {
  if (source.includes(selector)) {
    return true;
  }

  if (!group.template || !source.includes(group.template)) {
    return false;
  }

  return group.templateIds.some((id) => {
    const rendered = group.template
      .replace("${props.id}", id)
      .replace("${item.id}", id)
      .replace("${country.region}", id);

    return (
      selector === rendered &&
      (source.includes(`id="${id}"`) ||
        source.includes(`id: "${id}"`) ||
        source.includes(`"${id}"`))
    );
  });
}

function getRouteName(route) {
  return route.href === "/" ? "index" : route.href.slice(1);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function relative(filePath) {
  return path.relative(repoRoot, filePath);
}

main();
