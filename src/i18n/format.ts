/**
 * Fills {placeholders} in a dictionary string.
 *
 * Deliberately minimal: the dictionaries carry pre-pluralized keys
 * (…One / …Many) rather than relying on a plural engine, because Slovak
 * pluralization does not map onto English rules.
 */
export function t(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  )
}
