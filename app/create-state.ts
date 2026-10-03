import { DEFAULT_CLAUSES } from './constants.js'
import { createPet } from './create-pet.js'
import type { AppState } from './types.js'

/**
 * Makes the empty form a first visit starts with: one blank pet and the
 * default addendum terms.
 *
 * @returns {AppState} The state.
 */
function createState(): AppState {
  return {
    profile: {
      owners: '',
      phone: '',
      email: '',
      pets: [createPet()],
      emergencyContact: '',
      references: '',
      insurance: '',
    },
    addendum: {
      landlord: '',
      address: '',
      tenants: '',
      effectiveDate: '',
      deposit: '',
      fee: '',
      monthlyRent: '',
      clauses: [...DEFAULT_CLAUSES],
    },
  }
}

export { createState }
