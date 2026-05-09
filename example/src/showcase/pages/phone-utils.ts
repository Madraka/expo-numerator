export function getDefaultPhoneRegion(locale: string): string {
  if (locale === "tr-TR") {
    return "TR";
  }

  if (locale === "ja-JP") {
    return "JP";
  }

  if (locale === "de-DE") {
    return "DE";
  }

  if (locale === "fr-FR") {
    return "FR";
  }

  if (locale === "en-IN") {
    return "IN";
  }

  return "US";
}

export function getDefaultPhoneText(region: string): string {
  if (region === "TR") {
    return "0501 234 56 78";
  }

  if (region === "GB") {
    return "07400 123456";
  }

  if (region === "DE") {
    return "0151 23456789";
  }

  if (region === "FR") {
    return "06 12 34 56 78";
  }

  if (region === "IN") {
    return "81234 56789";
  }

  if (region === "JP") {
    return "090 1234 5678";
  }

  return "2015550123";
}
