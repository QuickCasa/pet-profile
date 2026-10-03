type PetType = 'dog' | 'cat' | 'other'

type PetSex = '' | 'female' | 'male'

type YesNo = '' | 'yes' | 'no'

type WeightUnit = 'kg' | 'lb'

/**
 * Yes or no facts about a pet's temperament and training, shown as a
 * checklist on the profile.
 */
type PetTrait =
  | 'houseTrained'
  | 'crateTrained'
  | 'goodWithDogs'
  | 'goodWithCats'
  | 'goodWithChildren'

interface Pet {
  /**
   * Stable across edits, so a re-render keeps each card's inputs in place.
   */
  id: string
  name: string
  type: PetType
  otherType: string
  breed: string
  colour: string
  sex: PetSex
  spayedOrNeutered: YesNo
  age: string
  weight: string
  weightUnit: WeightUnit
  microchip: string
  licence: string
  rabiesDate: string
  vaccinations: string
  vet: string
  traits: Record<PetTrait, boolean>
  /**
   * A service or support animal, which changes what the addendum can charge.
   */
  assistanceAnimal: boolean
  notes: string
  /**
   * A downscaled JPEG data URL, or an empty string for no photo.
   */
  photo: string
}

/**
 * What a renter fills in about themselves and their pets.
 */
interface Profile {
  /**
   * One name per line.
   */
  owners: string
  phone: string
  email: string
  pets: Pet[]
  emergencyContact: string
  references: string
  insurance: string
}

/**
 * What a landlord fills in to turn a profile into a pet addendum.
 */
interface Addendum {
  landlord: string
  address: string
  /**
   * One name per line. Falls back to the profile's owners when blank.
   */
  tenants: string
  effectiveDate: string
  deposit: string
  fee: string
  monthlyRent: string
  clauses: string[]
}

interface AppState {
  profile: Profile
  addendum: Addendum
}

/**
 * One fact about a pet, as a label and a value, for the page and both PDFs.
 */
interface PetFact {
  label: string
  value: string
}

/**
 * Anything JSON.parse can return. Saved state and share links are read as
 * this, then checked field by field before the page trusts them.
 */
type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type JsonObject = { [key: string]: JsonValue }

/**
 * How the PDF writer sets a block of text.
 */
interface PdfTextOptions {
  size?: number
  bold?: boolean
  muted?: boolean
  /**
   * Where the text starts, in points from the left edge.
   */
  x?: number
  /**
   * How wide it can run before wrapping.
   */
  width?: number
}

type ProfileTextField = Exclude<keyof Profile, 'pets'>

type AddendumTextField = Exclude<keyof Addendum, 'clauses'>

/**
 * A pet's card on the page and its position in the profile.
 */
interface PetLocation {
  card: HTMLElement
  index: number
}

export type {
  AddendumTextField,
  PetLocation,
  ProfileTextField,
  Addendum,
  AppState,
  JsonObject,
  JsonValue,
  PdfTextOptions,
  Pet,
  PetFact,
  PetSex,
  PetTrait,
  PetType,
  Profile,
  WeightUnit,
  YesNo,
}
