import { splitLines } from './split-lines.js'
import type { AppState } from './types.js'

/**
 * The tenants named in the addendum: the landlord's list if they typed one,
 * otherwise the owners from the pet profile.
 *
 * @param {AppState} state The profile and addendum.
 * @returns {string[]} The names, one per tenant.
 */
function getTenantNames(state: AppState): string[] {
  const tenants = splitLines(state.addendum.tenants)
  return tenants.length > 0 ? tenants : splitLines(state.profile.owners)
}

export { getTenantNames }
