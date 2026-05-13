describe("Expo config plugin", () => {
  it("returns config unchanged", () => {
    const plugin = require("../../../app.plugin.js") as <TConfig>(
      config: TConfig,
    ) => TConfig;
    const config = { name: "example" };

    expect(plugin(config)).toBe(config);
  });

  it("is reachable through the package export map", () => {
    const pluginPath = require.resolve("expo-numerator/app.plugin.js");
    const directPluginPath =
      require.resolve("expo-numerator/plugin/withExpoNumerator");
    const plugin = require(pluginPath) as { default?: unknown };
    const directPlugin = require(directPluginPath) as { default?: unknown };

    expect(typeof plugin).toBe("function");
    expect(typeof plugin.default).toBe("function");
    expect(typeof directPlugin).toBe("function");
    expect(typeof directPlugin.default).toBe("function");
  });
});
