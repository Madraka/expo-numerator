describe("Expo config plugin", () => {
  it("returns config unchanged", () => {
    const plugin = require("../../../app.plugin.js") as <TConfig>(
      config: TConfig,
    ) => TConfig;
    const config = { name: "example" };

    expect(plugin(config)).toBe(config);
  });
});
