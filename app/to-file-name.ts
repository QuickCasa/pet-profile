/**
 * Builds a safe file name from words such as pet names, for example
 * "pet-profile-biscuit-and-mochi.pdf".
 *
 * @param {string} prefix The start of the name, such as "pet-profile".
 * @param {readonly string[]} words Words to add, such as the pets' names.
 * @returns {string} The file name, with a .pdf extension.
 */
function toFileName(prefix: string, words: readonly string[]): string {
  const slug = words
    .map(word =>
      word
        .normalize('NFKD')
        .replaceAll(/\p{M}/gu, '')
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/gu, '-')
        .replaceAll(/^-+|-+$/gu, ''),
    )
    .filter(Boolean)
    .join('-and-')

  return slug === '' ? `${prefix}.pdf` : `${prefix}-${slug.slice(0, 60)}.pdf`
}

export { toFileName }
