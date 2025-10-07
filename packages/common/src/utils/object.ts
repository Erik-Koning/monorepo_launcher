/**
 * A helper function to safely retrieve a nested value from an object using a dot-notation path.
 * @param source The object to retrieve the value from.
 * @param path The dot-notation path to the value.
 * @returns The value if found, otherwise undefined.
 */
const getValueByPath = (source: any, path: string): any => {
  // biome-ignore lint/suspicious/noPrototypeBuiltins: This is a safe use case.
  return path.split('.').reduce((current, key) => (current && typeof current === 'object' && current.hasOwnProperty(key) ? current[key] : undefined), source);
};

/**
 * Creates a new object by extracting values from a source object based on a list of keys.
 * It allows specifying alternative paths for keys if they are not found at the top level of the source object.
 *
 * @param obj The source object.
 * @param keys An array of strings representing the keys for the new result object.
 * @param keyMap An optional object mapping keys from the `keys` array to an array of alternative dot-notation paths to look for the value in the source object.
 * @returns A new object with the specified keys and their resolved values.
 */
export function createObjectFromKeys<T extends object>(
  obj: T,
  keys: string[],
  keyMap: Record<string, string[]> = {},
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of keys) {
    // First, try to get the value directly from the object using the key.
    let value = (obj as Record<string, any>)[key];

    // If the value is not found directly, check the keyMap for alternative paths.
    if (value === undefined) {
      const alternativePaths = keyMap[key];
      if (alternativePaths) {
        for (const path of alternativePaths) {
          const nestedValue = getValueByPath(obj, path);
          if (nestedValue !== undefined) {
            value = nestedValue;
            break; // Use the first value found and stop searching.
          }
        }
      }
    }

    // Only add the key to the result if a value was found.
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
