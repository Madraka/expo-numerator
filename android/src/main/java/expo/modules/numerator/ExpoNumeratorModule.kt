package expo.modules.numerator

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.text.DecimalFormatSymbols
import java.util.Locale

class ExpoNumeratorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNumeratorModule")

    Function("getPlatformInfo") {
      mapOf(
        "platform" to "android",
        "moduleName" to "ExpoNumeratorModule",
        "native" to true
      )
    }

    Function("getPreferredLocale") {
      Locale.getDefault().toLanguageTag()
    }

    Function("getNumberSeparators") { localeTag: String? ->
      val locale = localeTag?.let { Locale.forLanguageTag(it) } ?: Locale.getDefault()
      val symbols = DecimalFormatSymbols.getInstance(locale)

      mapOf(
        "decimal" to symbols.decimalSeparator.toString(),
        "grouping" to symbols.groupingSeparator.toString()
      )
    }
  }
}
