import { DEFAULT_CLAUSES, PET_TRAITS } from './constants.js'
import { createPet } from './create-pet.js'
import { createState } from './create-state.js'
import type {
  Addendum,
  AppState,
  JsonObject,
  JsonValue,
  Pet,
  Profile,
} from './types.js'

/**
 * Narrows a JSON value to an object.
 *
 * @param {JsonValue | undefined} value The value.
 * @returns {JsonObject} The object, or an empty one when the value isn't an object.
 */
function asObject(value: JsonValue | undefined): JsonObject {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value
  }

  return {}
}

/**
 * Reads a string field.
 *
 * @param {JsonObject} source The object to read from.
 * @param {string} key The field.
 * @returns {string} The value, or an empty string when it isn't a string.
 */
function readString(source: JsonObject, key: string): string {
  const value = source[key]
  return typeof value === 'string' ? value : ''
}

/**
 * Reads a field that must be one of a fixed set of strings.
 *
 * @param {JsonObject} source The object to read from.
 * @param {string} key The field.
 * @param {readonly T[]} allowed The values it may take. The first is the fallback.
 * @returns {T} The value, or the fallback.
 */
function readChoice<T extends string>(
  source: JsonObject,
  key: string,
  allowed: readonly T[],
): T {
  const value = source[key]
  const match = allowed.find(option => option === value)
  return match ?? (allowed[0] as T)
}

/**
 * Rebuilds a pet from saved data, keeping only fields of the right type.
 *
 * @param {JsonValue} value The saved pet.
 * @returns {Pet} The pet.
 */
function normalizePet(value: JsonValue): Pet {
  const source = asObject(value)
  const pet = createPet()
  const traits = asObject(source.traits)
  const photo = readString(source, 'photo')

  for (const trait of PET_TRAITS) {
    pet.traits[trait] = traits[trait] === true
  }

  return {
    ...pet,
    id: readString(source, 'id') || pet.id,
    name: readString(source, 'name'),
    type: readChoice(source, 'type', ['dog', 'cat', 'other']),
    otherType: readString(source, 'otherType'),
    breed: readString(source, 'breed'),
    colour: readString(source, 'colour'),
    sex: readChoice(source, 'sex', ['', 'female', 'male']),
    spayedOrNeutered: readChoice(source, 'spayedOrNeutered', ['', 'yes', 'no']),
    age: readString(source, 'age'),
    weight: readString(source, 'weight'),
    weightUnit: readChoice(source, 'weightUnit', ['kg', 'lb']),
    microchip: readString(source, 'microchip'),
    licence: readString(source, 'licence'),
    rabiesDate: readString(source, 'rabiesDate'),
    vaccinations: readString(source, 'vaccinations'),
    vet: readString(source, 'vet'),
    assistanceAnimal: source.assistanceAnimal === true,
    notes: readString(source, 'notes'),
    photo: photo.startsWith('data:image/jpeg;base64,') ? photo : '',
  }
}

/**
 * Rebuilds a profile from saved data or a share link.
 *
 * @param {JsonValue | undefined} value The saved profile.
 * @returns {Profile} The profile, with at least one pet.
 */
function normalizeProfile(value: JsonValue | undefined): Profile {
  const source = asObject(value)
  const pets = Array.isArray(source.pets)
    ? source.pets.map(pet => normalizePet(pet))
    : []

  return {
    owners: readString(source, 'owners'),
    phone: readString(source, 'phone'),
    email: readString(source, 'email'),
    pets: pets.length > 0 ? pets : [createPet()],
    emergencyContact: readString(source, 'emergencyContact'),
    references: readString(source, 'references'),
    insurance: readString(source, 'insurance'),
  }
}

/**
 * Rebuilds the addendum from saved data. A saved list with no terms falls
 * back to the defaults.
 *
 * @param {JsonValue | undefined} value The saved addendum.
 * @returns {Addendum} The addendum.
 */
function normalizeAddendum(value: JsonValue | undefined): Addendum {
  const source = asObject(value)
  const clauses = Array.isArray(source.clauses)
    ? source.clauses.filter(clause => typeof clause === 'string')
    : []

  return {
    landlord: readString(source, 'landlord'),
    address: readString(source, 'address'),
    tenants: readString(source, 'tenants'),
    effectiveDate: readString(source, 'effectiveDate'),
    deposit: readString(source, 'deposit'),
    fee: readString(source, 'fee'),
    monthlyRent: readString(source, 'monthlyRent'),
    clauses: clauses.length > 0 ? clauses : [...DEFAULT_CLAUSES],
  }
}

/**
 * Rebuilds the whole page state from saved data.
 *
 * @param {JsonValue | undefined} value The saved state.
 * @returns {AppState} The state, or a fresh one when nothing usable was saved.
 */
function normalizeState(value: JsonValue | undefined): AppState {
  if (value === undefined) {
    return createState()
  }

  const source = asObject(value)

  return {
    profile: normalizeProfile(source.profile),
    addendum: normalizeAddendum(source.addendum),
  }
}

export { normalizeProfile, normalizeState }
