export type NumberingSystem = "latn" | "arab" | "arabext" | "deva";

export const digitMaps: Record<NumberingSystem, readonly string[]> =
  Object.freeze({
    latn: Object.freeze(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
    arab: Object.freeze(["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]),
    arabext: Object.freeze(["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]),
    deva: Object.freeze(["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]),
  });
