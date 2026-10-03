import type { Pet } from './types.js'

/**
 * Makes a blank pet with a fresh id.
 *
 * @returns {Pet} The pet.
 */
function createPet(): Pet {
  return {
    id: crypto.randomUUID(),
    name: '',
    type: 'dog',
    otherType: '',
    breed: '',
    colour: '',
    sex: '',
    spayedOrNeutered: '',
    age: '',
    weight: '',
    weightUnit: 'kg',
    microchip: '',
    licence: '',
    rabiesDate: '',
    vaccinations: '',
    vet: '',
    traits: {
      houseTrained: false,
      crateTrained: false,
      goodWithDogs: false,
      goodWithCats: false,
      goodWithChildren: false,
    },
    assistanceAnimal: false,
    notes: '',
    photo: '',
  }
}

export { createPet }
