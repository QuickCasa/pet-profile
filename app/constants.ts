import type { PetSex, PetTrait, PetType, YesNo } from './types.js'

const STORAGE_KEY = 'quickcasa-pet-profile'

/**
 * Share links carry the profile in the URL fragment, which browsers never
 * send to a server, after this prefix.
 */
const SHARE_PREFIX = '#profile='

/**
 * Photos are scaled down to fit inside this many pixels on their longest side,
 * which keeps them sharp in a PDF and small enough to save in the browser.
 */
const PHOTO_MAX_SIZE = 800

const PHOTO_QUALITY = 0.82

const PET_TYPE_LABELS: Readonly<Record<PetType, string>> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
}

const PET_SEX_LABELS: Readonly<Record<Exclude<PetSex, ''>, string>> = {
  female: 'Female',
  male: 'Male',
}

const YES_NO_LABELS: Readonly<Record<Exclude<YesNo, ''>, string>> = {
  yes: 'Yes',
  no: 'No',
}

const PET_TRAITS: readonly PetTrait[] = [
  'houseTrained',
  'crateTrained',
  'goodWithDogs',
  'goodWithCats',
  'goodWithChildren',
]

const TRAIT_LABELS: Readonly<Record<PetTrait, string>> = {
  houseTrained: 'House trained',
  crateTrained: 'Crate trained',
  goodWithDogs: 'Good with dogs',
  goodWithCats: 'Good with cats',
  goodWithChildren: 'Good with children',
}

/**
 * The addendum's starting terms. Landlords can edit, remove or add to them,
 * and the page says to have the result reviewed before anyone signs it.
 */
const DEFAULT_CLAUSES: readonly string[] = [
  "The tenant may keep only the pets listed in this addendum at the property. Any other animal needs the landlord's written consent first.",
  "The tenant is responsible for the pets' behaviour, and for any damage or injury they cause.",
  'The tenant will clean up after the pets right away, in the unit and anywhere on the property.',
  'The tenant will keep the pets licensed and vaccinated as local law requires.',
  'In shared areas, the pets will be on a leash or carried.',
  'The tenant will not let the pets disturb other residents, including with repeated noise.',
  "If a pet needs care and the tenant can't be reached, the landlord may call the tenant's emergency contact.",
]

export {
  DEFAULT_CLAUSES,
  PET_SEX_LABELS,
  PET_TRAITS,
  PET_TYPE_LABELS,
  PHOTO_MAX_SIZE,
  PHOTO_QUALITY,
  SHARE_PREFIX,
  STORAGE_KEY,
  TRAIT_LABELS,
  YES_NO_LABELS,
}
