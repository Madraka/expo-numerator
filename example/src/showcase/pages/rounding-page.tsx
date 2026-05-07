import { roundDecimal, type RoundingMode } from "expo-numerator";

import { DataTable, PageScaffold, Section } from "../components";

const roundingModes: RoundingMode[] = [
  "ceil",
  "floor",
  "expand",
  "trunc",
  "halfCeil",
  "halfFloor",
  "halfExpand",
  "halfTrunc",
  "halfEven",
];

export function RoundingPage() {
  return (
    <PageScaffold
      pageId="rounding"
      title="Rounding"
      caption="String-based rounding modes for positive, negative, tie, and large decimal values."
    >
      <Section title="Tie handling">
        <DataTable
          rows={roundingModes.map((mode) => [
            mode,
            roundDecimal("2.5", { roundingMode: mode, scale: 0 }).value,
          ])}
        />
      </Section>

      <Section title="Negative tie handling">
        <DataTable
          rows={roundingModes.map((mode) => [
            mode,
            roundDecimal("-2.5", { roundingMode: mode, scale: 0 }).value,
          ])}
        />
      </Section>

      <Section title="Large-number precision">
        <DataTable
          rows={[
            [
              "halfEven",
              roundDecimal("999999999999999999999.125", {
                roundingMode: "halfEven",
                scale: 2,
              }).value,
            ],
            [
              "halfExpand",
              roundDecimal("999999999999999999999.125", {
                roundingMode: "halfExpand",
                scale: 2,
              }).value,
            ],
            [
              "trunc",
              roundDecimal("12345678901234567890.98765", {
                roundingMode: "trunc",
                scale: 3,
              }).value,
            ],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}
