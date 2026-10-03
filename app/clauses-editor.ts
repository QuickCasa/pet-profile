/**
 * Draws the addendum terms as editable text boxes, each with a remove button.
 *
 * @param {HTMLOListElement} list The list the terms go in.
 * @param {readonly string[]} clauses The terms.
 */
function renderClauses(
  list: HTMLOListElement,
  clauses: readonly string[],
): void {
  const items = clauses.map((clause, index) => {
    const item = document.createElement('li')
    const row = document.createElement('div')
    const text = document.createElement('textarea')
    const remove = document.createElement('button')
    const number = String(index + 1)

    row.className = 'clause'
    text.rows = 2
    text.value = clause
    text.dataset.clause = String(index)
    text.setAttribute('aria-label', `Term ${number}`)
    remove.type = 'button'
    remove.className = 'remove'
    remove.textContent = 'Remove'
    remove.dataset.removeClause = String(index)
    remove.setAttribute('aria-label', `Remove term ${number}`)
    row.append(text, remove)
    item.append(row)
    return item
  })

  list.replaceChildren(...items)
}

export { renderClauses }
