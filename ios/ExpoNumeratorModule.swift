import ExpoModulesCore
import Foundation

public class ExpoNumeratorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNumeratorModule")

    Function("getPlatformInfo") {
      return [
        "platform": "ios",
        "moduleName": "ExpoNumeratorModule",
        "native": true
      ] as [String: Any]
    }

    Function("getPreferredLocale") {
      return Locale.autoupdatingCurrent.identifier.replacingOccurrences(of: "_", with: "-")
    }

    Function("getNumberSeparators") { (locale: String?) -> [String: String] in
      let formatter = NumberFormatter()
      formatter.locale = locale.map { Locale(identifier: $0) } ?? Locale.autoupdatingCurrent

      return [
        "decimal": formatter.decimalSeparator ?? ".",
        "grouping": formatter.groupingSeparator ?? ","
      ]
    }
  }
}
