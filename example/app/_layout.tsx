import { Stack } from "expo-router";

import { ShowcaseProvider } from "../src/showcase/provider";

export default function RootLayout() {
  return (
    <ShowcaseProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#F5F7FA" },
          headerLargeTitle: true,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Overview" }} />
        <Stack.Screen name="values" options={{ title: "Values" }} />
        <Stack.Screen name="currency" options={{ title: "Currency" }} />
        <Stack.Screen name="units" options={{ title: "Units" }} />
        <Stack.Screen name="locale" options={{ title: "Locale" }} />
        <Stack.Screen name="rounding" options={{ title: "Rounding" }} />
        <Stack.Screen name="format" options={{ title: "Format" }} />
        <Stack.Screen name="parse" options={{ title: "Parse" }} />
        <Stack.Screen name="errors" options={{ title: "Errors" }} />
        <Stack.Screen name="input" options={{ title: "Input Lab" }} />
        <Stack.Screen name="expo" options={{ title: "Expo" }} />
        <Stack.Screen name="package" options={{ title: "Package" }} />
        <Stack.Screen name="hardening" options={{ title: "Hardening" }} />
      </Stack>
    </ShowcaseProvider>
  );
}
