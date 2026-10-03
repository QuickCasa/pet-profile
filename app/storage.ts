import { STORAGE_KEY } from './constants.js'
import { normalizeState } from './normalize-state.js'
import type { AppState, JsonValue } from './types.js'

/**
 * Restores the form from the last visit. Anything missing or malformed falls
 * back to a blank form, so an old or edited save can't break the page.
 *
 * @returns {AppState} The saved state, or a fresh one.
 */
function loadState(): AppState {
  try {
    const text = localStorage.getItem(STORAGE_KEY)

    if (text !== null) {
      return normalizeState(JSON.parse(text) as JsonValue)
    }
  } catch {
    // A blocked or corrupt save just means starting fresh.
  }

  return normalizeState(undefined)
}

/**
 * Saves the form in this browser. Saving fails in some private windows and
 * when photos fill the browser's storage, and the page works without it.
 *
 * @param {AppState} state The state.
 * @returns {boolean} Whether the save worked.
 */
function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/**
 * Forgets everything saved in this browser.
 */
function clearSavedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is blocked.
  }
}

export { clearSavedState, loadState, saveState }
