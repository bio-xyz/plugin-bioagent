// regexUtils.ts

/**
 * Extracts the first bracketed substring (including the brackets).
 * Equivalent to Python's `re.search(r"\[.*\]", string, re.DOTALL)`.
 *
 * @param input - The string to search
 * @returns The bracketed substring (e.g., "[something]") or null if none found
 */
export function extractBracketContent(input: string): string | null {
    // Use a dot-all style pattern in JavaScript: [\s\S] matches any character including newlines
    // The parentheses are optional if you only want the entire match in group(0)
    const match = input.match(/\[([\s\S]*?)\]/);
    return match ? match[0] : null;
}

/**
 * Checks if a string (after trimming) is exactly "[]".
 * Equivalent to Python's `return string.strip() == "[]"`.
 *
 * @param input - The string to check
 * @returns True if the trimmed string is "[]", false otherwise
 */
export function isEmptyArray(input: string): boolean {
    return input.trim() === "[]";
}

/**
 * Replaces certain single quotes with double quotes, mimicking the Python regex:
 *  re.sub(r"(?<!\\)'(?=[^:]+?')|(?<=: )'(?=[^']+?')", '"', input_string)
 *
 * IMPORTANT: This relies on lookbehind assertions which require a modern JavaScript/TypeScript runtime.
 * If your environment doesn't support lookbehinds, you must rewrite this regex.
 *
 * @param input - The string with possible single quotes to replace
 * @returns The corrected string with targeted single quotes replaced by double quotes
 */
export function convertToValidJsonString(input: string): string {
    // Pattern breakdown:
    //  1) (?<!\\)'(?=[^:]+?')
    //      Match `'` not preceded by a backslash, followed by any chars up until another `'`, but not containing ':' in that span.
    //  2) (?<=: )'(?=[^']+?')
    //      Match `'` that is preceded by ': ', followed by chars up to the next `'`.
    //
    // Both are replaced with `"`.
    const pattern = /(?<!\\)'(?=[^:]+?')|(?<=: )'(?=[^']+?')/g;
    return input.replace(pattern, '"');
}
