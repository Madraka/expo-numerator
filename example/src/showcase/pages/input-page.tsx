import {
  applyNumberInputNativeTextChange,
  commitNumberInputState,
  createIntegerInputOptions,
  createMoneyInputOptions,
  createNumberInputState,
  createPercentInputOptions,
  createUnitInputOptions,
  formatNumberInputOnBlur,
  MoneyInput,
  NumberInput,
  type NumberInputOptions,
  type NumberInputState,
  resetNumberInputState,
  useNumberInput,
} from "expo-numerator";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  ActionButton,
  DataLine,
  DataTable,
  InlineActions,
  PageScaffold,
  Section,
  showcaseStyles,
} from "../components";
import {
  getDefaultMoneyInputValue,
  getMoneyInputPlaceholder,
  getShowcaseCurrencyForLocale,
} from "../money-examples";
import { useShowcase } from "../provider";
import { getNumericValueText } from "../value-text";

export function InputPage() {
  const { numerator } = useShowcase();
  const currency = getShowcaseCurrencyForLocale(numerator.locale);
  const areaUnitOptions = createUnitInputOptions("m²", {
    locale: numerator.locale,
  });
  const moneyOptions = createMoneyInputOptions(currency, {
    defaultValue: getDefaultMoneyInputValue(currency),
    entryMode: "liveGroupedEndLocked",
    locale: numerator.locale,
  });
  const minorUnitOptions = createMoneyInputOptions(currency, {
    entryMode: "minorUnits",
    locale: numerator.locale,
  });
  const integerMajorOptions = createMoneyInputOptions(currency, {
    entryMode: "integerMajor",
    locale: numerator.locale,
  });
  const percentOptions = createPercentInputOptions({
    defaultValue: "0.125",
    locale: numerator.locale,
  });
  const integerOptions = createIntegerInputOptions({
    allowNegative: false,
    defaultValue: "1200",
    formatOnBlur: true,
    locale: numerator.locale,
    maxInputLength: 6,
    useGrouping: true,
  });
  const fractionDigits = moneyOptions.maximumFractionDigits ?? 0;
  const [componentValue, setComponentValue] = useState<string | null>(null);
  const [componentState, setComponentState] = useState<NumberInputState | null>(
    null,
  );
  const replay = applyNumberInputNativeTextChange(
    createNumberInputState({ defaultValue: "12.30" }),
    "45.60",
  );
  const committed = commitNumberInputState(replay);
  const reset = resetNumberInputState(replay);

  return (
    <PageScaffold
      pageId="input"
      title="Input Lab"
      caption="Headless state, styles-free component, caret inference, and commit/reset lifecycle."
    >
      <Section title="Definition model">
        <DataTable
          rows={[
            ["mode", "decimal | money | percent | unit"],
            ["format source", "NumberFormatOptions minus style"],
            ["parse source", "locale + parseMode"],
            ["money definition", "currency registry minor units"],
            ["percent definition", "editable 12.5 emits semantic 0.125"],
            ["unit definition", "unit string stays with emitted value"],
            ["constraints", "allowNegative, allowDecimal, maxInputLength"],
            [
              "money entry modes",
              "plain | liveGroupedEndLocked | minorUnits | integerMajor",
            ],
          ]}
        />
      </Section>

      <Section title="Configured input modes">
        <View style={styles.scenarioGrid}>
          <InputScenario
            key={`money-${numerator.locale}-${currency}`}
            id="lifecycle"
            title="Money lifecycle"
            caption={`${currency} uses registry fraction digits and locale decimal symbols.`}
            options={moneyOptions}
            placeholder={getMoneyInputPlaceholder(numerator.locale, currency)}
            rows={[
              ["currency", currency],
              ["fraction digits", String(fractionDigits)],
              ["entryMode", "liveGroupedEndLocked"],
              ["caretBehavior", "end"],
              ["formatOnBlur", "true"],
            ]}
          />
          <InputScenario
            key={`percent-${numerator.locale}`}
            id="percent"
            title="Percent"
            caption="Typed display is human percent; emitted value is semantic ratio."
            options={percentOptions}
            placeholder={numerator.locale === "tr-TR" ? "12,5" : "12.5"}
            rows={[
              ["default semantic value", "0.125"],
              ["initial editable text", "12.5"],
              ["emitted kind", "percent"],
            ]}
          />
          <InputScenario
            key={`unit-${numerator.locale}`}
            id="unit"
            title="Area unit"
            caption="Unit mode keeps numeric parsing separate from the area label."
            options={{
              ...areaUnitOptions,
              defaultValue: "1500",
            }}
            placeholder="1500"
            rows={[
              ["dimension", "area"],
              ["unit", areaUnitOptions.unit ?? "none"],
              [
                "maximumFractionDigits",
                String(areaUnitOptions.maximumFractionDigits),
              ],
              ["emitted kind", "unit"],
            ]}
          />
          <InputScenario
            key={`integer-${numerator.locale}`}
            id="integer"
            title="Integer constrained"
            caption="Decimal and negative characters are stripped before parsing."
            options={integerOptions}
            placeholder="1200"
            rows={[
              ["allowDecimal", "false"],
              ["allowNegative", "false"],
              ["maxInputLength", "6"],
            ]}
          />
        </View>
      </Section>

      <Section title="Money entry strategies">
        <DataTable
          rows={[
            ["plain", "2648 -> 2648 while editing, blur -> 2.648,00"],
            ["liveGroupedEndLocked", "2648 -> 2.648 while typing"],
            [
              "minorUnits",
              `2648 -> ${formatNumberInputOnBlur(
                applyNumberInputNativeTextChange(
                  createNumberInputState(minorUnitOptions),
                  "2648",
                  minorUnitOptions,
                ),
                minorUnitOptions,
              ).text}`,
            ],
            [
              "integerMajor",
              `2648 -> ${formatNumberInputOnBlur(
                applyNumberInputNativeTextChange(
                  createNumberInputState(integerMajorOptions),
                  "2648",
                  integerMajorOptions,
                ),
                integerMajorOptions,
              ).text}`,
            ],
          ]}
        />
      </Section>

      <Section title="Ready-made component">
        <MoneyInput
          key={`component-${numerator.locale}-${currency}`}
          accessibilityLabel="Amount input"
          currency={currency}
          entryMode="liveGroupedEndLocked"
          locale={numerator.locale}
          onInputStateChange={setComponentState}
          onValueChange={(value) => setComponentValue(getNumericValueText(value))}
          placeholder={getMoneyInputPlaceholder(numerator.locale, currency)}
          style={showcaseStyles.input}
          testID="expo-numerator-amount-input"
        />
        <DataLine testID="expo-numerator-amount-parsed">
          {`parsed=${componentValue ?? "empty"}`}
        </DataLine>
        <DataLine testID="expo-numerator-amount-state">
          {`text=${componentState?.text ?? ""} valid=${componentState?.isValid ?? true} dirty=${componentState?.isDirty ?? false}`}
        </DataLine>
      </Section>

      <Section title="Replay fixture">
        <DataTable
          rows={[
            ["draft text", replay.text],
            ["draft dirty", replay.isDirty ? "true" : "false"],
            ["committed dirty", committed.isDirty ? "true" : "false"],
            ["reset text", reset.text],
          ]}
        />
      </Section>
    </PageScaffold>
  );
}

function InputScenario(props: {
  id: string;
  title: string;
  caption: string;
  options: NumberInputOptions;
  placeholder: string;
  rows: Array<[string, string]>;
}) {
  const input = useNumberInput(props.options);
  const blurPreview = formatNumberInputOnBlur(input, props.options);

  return (
    <View style={styles.scenarioCard}>
      <View style={styles.scenarioHeader}>
        <Text style={styles.scenarioTitle}>{props.title}</Text>
        <Text style={styles.scenarioCaption}>{props.caption}</Text>
      </View>
      <TextInput
        {...input.inputProps}
        keyboardType="decimal-pad"
        placeholder={props.placeholder}
        style={showcaseStyles.input}
        testID={`expo-numerator-${props.id}-input`}
      />
      <InlineActions>
        <ActionButton label="Commit" onPress={input.commit} />
        <ActionButton label="Reset" onPress={() => input.reset()} />
        <ActionButton label="Toggle sign" onPress={input.toggleSign} />
      </InlineActions>
      <DataTable
        rows={[
          ["text", input.text],
          ["value", describeNumericValue(input.value)],
          ["committed", describeNumericValue(input.committedValue)],
          ["state", getInputStateSummary(input)],
          ["selection", `${input.selection.start}:${input.selection.end}`],
          ["blur preview", blurPreview.text],
          ...props.rows,
        ]}
      />
    </View>
  );
}

function describeNumericValue(value: NumberInputState["value"]): string {
  if (value === null) {
    return "empty";
  }

  if (value.kind === "money") {
    return `${value.amount} ${value.currency}`;
  }

  if (value.kind === "unit") {
    return `${value.value} ${value.unit}`;
  }

  if (value.kind === "percent") {
    return `${value.value} ratio`;
  }

  return value.value;
}

function getInputStateSummary(state: NumberInputState): string {
  if (state.error) {
    return state.error.code;
  }

  return [
    state.isValid ? "valid" : "invalid",
    state.isDirty ? "dirty" : "clean",
    state.isFocused ? "focused" : "blurred",
  ].join(" / ");
}

const styles = StyleSheet.create({
  scenarioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  scenarioCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E1E7EF",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 300,
    flexGrow: 1,
    gap: 12,
    padding: 14,
  },
  scenarioHeader: {
    gap: 4,
  },
  scenarioTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  scenarioCaption: {
    color: "#586174",
    fontSize: 13,
    lineHeight: 19,
  },
});
