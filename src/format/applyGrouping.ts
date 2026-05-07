import type { GroupingStrategy } from "../locale/localeRegistry";

export function applyGrouping(
  integer: string,
  grouping: GroupingStrategy,
): string {
  if (integer.length <= grouping.primary) {
    return integer;
  }

  const groups: string[] = [];
  let cursor = integer.length;

  groups.unshift(integer.slice(Math.max(0, cursor - grouping.primary), cursor));
  cursor -= grouping.primary;

  const secondarySize = grouping.secondary ?? grouping.primary;

  while (cursor > 0) {
    const start = Math.max(0, cursor - secondarySize);
    groups.unshift(integer.slice(start, cursor));
    cursor = start;
  }

  return groups.join(grouping.separator);
}
