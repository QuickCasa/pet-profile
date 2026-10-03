import { PET_SEX_LABELS, PET_TYPE_LABELS } from './constants.js'
import { formatDate } from './format-date.js'
import type { Pet, PetFact } from './types.js'

/**
 * Names the kind of animal, using the owner's own words for "other".
 *
 * @param {Pet} pet The pet.
 * @returns {string} Such as "Dog", or "Rabbit" for another animal.
 */
function describeType(pet: Pet): string {
  if (pet.type === 'other') {
    return pet.otherType.trim() || PET_TYPE_LABELS.other
  }

  return PET_TYPE_LABELS[pet.type]
}

/**
 * Combines sex and spay or neuter status, such as "Female, spayed".
 *
 * @param {Pet} pet The pet.
 * @returns {string} The description, or an empty string when neither is known.
 */
function describeSex(pet: Pet): string {
  const sex = pet.sex === '' ? '' : PET_SEX_LABELS[pet.sex]
  let status = ''

  if (pet.spayedOrNeutered === 'yes') {
    status = pet.sex === 'male' ? 'neutered' : 'spayed'
  } else if (pet.spayedOrNeutered === 'no') {
    status = pet.sex === 'male' ? 'not neutered' : 'not spayed'
  }

  if (pet.sex === '' && pet.spayedOrNeutered === 'yes') {
    return 'Spayed or neutered'
  }

  if (pet.sex === '' && pet.spayedOrNeutered === 'no') {
    return 'Not spayed or neutered'
  }

  return [sex, status].filter(Boolean).join(', ')
}

/**
 * Lists what's known about a pet, leaving out anything left blank, in the
 * order both PDFs show it.
 *
 * @param {Pet} pet The pet.
 * @returns {PetFact[]} The facts.
 */
function describePet(pet: Pet): PetFact[] {
  const weight = pet.weight.trim()
  const facts: PetFact[] = [
    { label: 'Animal', value: describeType(pet) },
    { label: 'Breed', value: pet.breed },
    { label: 'Colour and markings', value: pet.colour },
    { label: 'Sex', value: describeSex(pet) },
    { label: 'Age', value: pet.age },
    {
      label: 'Weight',
      value: weight === '' ? '' : `${weight} ${pet.weightUnit}`,
    },
    { label: 'Microchip', value: pet.microchip },
    { label: 'Licence', value: pet.licence },
    { label: 'Rabies vaccine', value: formatDate(pet.rabiesDate.trim()) },
    { label: 'Other vaccines', value: pet.vaccinations },
    { label: 'Vet', value: pet.vet },
    {
      label: 'Service or support animal',
      value: pet.assistanceAnimal ? 'Yes' : '',
    },
  ]

  return facts
    .map(fact => ({ ...fact, value: fact.value.trim() }))
    .filter(fact => fact.value !== '')
}

export { describePet, describeType }
