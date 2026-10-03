import type { Pet } from './types.js'

/**
 * Text fields on a pet, which take whatever the owner types.
 */
const TEXT_FIELDS = new Set([
  'name',
  'otherType',
  'breed',
  'colour',
  'age',
  'weight',
  'microchip',
  'licence',
  'rabiesDate',
  'vaccinations',
  'vet',
  'notes',
] as const)

type TextField = typeof TEXT_FIELDS extends Set<infer T> ? T : never

/**
 * Checks a field name is one of the free text fields.
 *
 * @param {string} field The field name.
 * @returns {boolean} True for a text field.
 */
function isTextField(field: string): field is TextField {
  return TEXT_FIELDS.has(field as TextField)
}

/**
 * Accepts a value only when it's one of the allowed choices.
 *
 * @param {string} value The value from the form.
 * @param {readonly T[]} allowed The values the field may take.
 * @param {T} current The field's value now, kept when the new one isn't allowed.
 * @returns {T} The value to store.
 */
function pickChoice<T extends string>(
  value: string,
  allowed: readonly T[],
  current: T,
): T {
  return allowed.find(choice => choice === value) ?? current
}

/**
 * Copies one form control's value onto a pet. Fields with a fixed set of
 * values only accept those values, so a tampered form can't store anything
 * else.
 *
 * @param {Pet} pet The pet to update.
 * @param {string} field The field, from the control's data-pet-field.
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} control The control.
 */
function applyPetField(
  pet: Pet,
  field: string,
  control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): void {
  const { value } = control

  if (isTextField(field)) {
    pet[field] = value
    return
  }

  switch (field) {
    case 'type': {
      pet.type = pickChoice(value, ['dog', 'cat', 'other'], pet.type)
      break
    }
    case 'sex': {
      pet.sex = pickChoice(value, ['', 'female', 'male'], pet.sex)
      break
    }
    case 'spayedOrNeutered': {
      pet.spayedOrNeutered = pickChoice(
        value,
        ['', 'yes', 'no'],
        pet.spayedOrNeutered,
      )
      break
    }
    case 'weightUnit': {
      pet.weightUnit = pickChoice(value, ['kg', 'lb'], pet.weightUnit)
      break
    }
    case 'assistanceAnimal': {
      pet.assistanceAnimal =
        control instanceof HTMLInputElement && control.checked
      break
    }
    default: {
      break
    }
  }
}

export { applyPetField }
