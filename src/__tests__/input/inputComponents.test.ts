import { IntegerInput, MoneyInput, PercentInput, UnitInput } from "../../index";

describe("convenience input components", () => {
  it("exports ready-made input wrappers for common numeric domains", () => {
    expect(typeof MoneyInput).toBe("object");
    expect(typeof PercentInput).toBe("object");
    expect(typeof IntegerInput).toBe("object");
    expect(typeof UnitInput).toBe("object");
  });
});
