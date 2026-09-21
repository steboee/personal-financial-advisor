import type { Dictionary } from './dictionaries'

/**
 * Category names are stored in the database as the English seed names
 * ("Groceries", "Dining out", …), so the stored name doubles as the
 * translation key.
 *
 * A category the user added themselves has no entry, and is shown exactly as
 * they typed it — translating it is neither possible nor wanted.
 */
export function categoryName(dict: Dictionary, name: string): string {
  const names: Record<string, string> = dict.categoryNames
  return names[name] ?? name
}
