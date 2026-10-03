/**
 * Splits a multi-line field, such as a list of names, into its non-blank
 * lines.
 *
 * @param {string} text The field.
 * @returns {string[]} The lines, trimmed.
 */
function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line !== '')
}

export { splitLines }
