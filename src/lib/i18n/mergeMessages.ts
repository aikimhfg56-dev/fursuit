type MessageValue = string | MessageTree | MessageValue[];
type MessageTree = { [key: string]: MessageValue };

function isPlainObject(value: unknown): value is MessageTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merges a region override tree onto a base message tree. Used so
 * en-gb/en-au only need to declare the handful of strings that actually
 * differ from en-us (spelling, currency wording, etc.) instead of
 * duplicating the entire English message set per region.
 */
export function mergeMessages(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];

    result[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? mergeMessages(baseValue, overrideValue)
        : overrideValue;
  }

  return result;
}
