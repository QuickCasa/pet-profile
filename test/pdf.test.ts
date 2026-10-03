import { jsPDF as JsPdf } from 'jspdf'
import { describe, expect, it } from 'vitest'
import { createPet } from '../app/create-pet.js'
import { createState } from '../app/create-state.js'
import { buildAddendumPdf } from '../app/pdf/build-addendum-pdf.js'
import { buildProfilePdf } from '../app/pdf/build-profile-pdf.js'
import type { AppState, Pet } from '../app/types.js'

/**
 * Builds a pet with a few details filled in.
 *
 * @param {Partial<Pet>} details The details to set.
 * @returns {Pet} The pet.
 */
function petWith(details: Partial<Pet>): Pet {
  return { ...createPet(), ...details }
}

/**
 * Builds a filled-in profile and addendum.
 *
 * @returns {AppState} The state.
 */
function filledState(): AppState {
  const state = createState()

  state.profile = {
    ...state.profile,
    owners: 'Jordan Lee\nSam Rivera',
    phone: '519-555-0142',
    email: 'jordan@example.com',
    emergencyContact: 'Alex Lee, 519-555-0199',
    pets: [
      petWith({
        name: 'Biscuit',
        breed: 'Beagle',
        colour: 'Tan and white',
        sex: 'female',
        spayedOrNeutered: 'yes',
        weight: '11',
        microchip: '985112',
        rabiesDate: '2026-04-12',
        traits: {
          houseTrained: true,
          crateTrained: false,
          goodWithDogs: true,
          goodWithCats: false,
          goodWithChildren: true,
        },
      }),
      petWith({ name: 'Mochi', type: 'cat', assistanceAnimal: true }),
    ],
  }
  state.addendum = {
    ...state.addendum,
    landlord: 'Maple Court Properties',
    address: '12 Maple Court, Unit 4, Kitchener, ON',
    effectiveDate: '2026-11-01',
    deposit: '$300',
    monthlyRent: '$25',
  }

  return state
}

/**
 * Renders a document to its raw PDF text, which holds every string drawn on
 * its pages because jsPDF doesn't compress by default.
 *
 * @param {JsPdf} pdf The document.
 * @returns {string} The PDF source.
 */
function sourceOf(pdf: JsPdf): string {
  return pdf.output()
}

describe('buildProfilePdf', () => {
  it('includes the owners, each pet and its details', () => {
    const source = sourceOf(buildProfilePdf(filledState().profile, JsPdf))

    expect(source).toContain('Pet profile')
    expect(source).toContain('Jordan Lee, Sam Rivera')
    expect(source).toContain('Biscuit')
    expect(source).toContain('Female, spayed')
    expect(source).toContain('11 kg')
    expect(source).toContain('April 12, 2026')
    expect(source).toContain(
      'House trained, Good with dogs, Good with children',
    )
    expect(source).toContain('Mochi')
    expect(source).toContain('Alex Lee, 519-555-0199')
    expect(source).toContain('Page 1 of 1')
  })

  it('starts new pages for long profiles', () => {
    const state = filledState()
    state.profile.pets = Array.from({ length: 6 }, (_, index) =>
      petWith({ name: `Pet ${String(index + 1)}`, notes: 'Calm. '.repeat(80) }),
    )

    const pdf = buildProfilePdf(state.profile, JsPdf)

    expect(pdf.getNumberOfPages()).toBeGreaterThan(1)
  })
})

describe('buildAddendumPdf', () => {
  it('names the parties, the pets and the charges, then the terms and signatures', () => {
    const source = sourceOf(buildAddendumPdf(filledState(), JsPdf))

    expect(source).toContain('Pet Addendum')
    expect(source).toContain('Maple Court Properties')
    expect(source).toContain('November 1, 2026')
    expect(source).toContain(
      'Dog, Beagle, Tan and white, 11 kg, microchip 985112',
    )
    expect(source).toContain('$300')
    expect(source).toContain('$25')
    expect(source).toContain('No deposit, fee or pet rent applies to Mochi')
    expect(source).toContain('1. The tenant may keep only the pets listed')
    expect(source).toContain('Tenant: Jordan Lee')
    expect(source).toContain('Tenant: Sam Rivera')
  })

  it('leaves blanks to fill in by hand and charges nothing when every pet is an assistance animal', () => {
    const state = createState()
    state.profile.pets = [petWith({ name: 'Rex', assistanceAnimal: true })]
    state.addendum.deposit = '$500'

    const source = sourceOf(buildAddendumPdf(state, JsPdf))

    expect(source).toContain('lease between ____________________')
    expect(source).not.toContain('$500')
    expect(source).toContain('No deposit, fee or pet rent applies to Rex')
  })

  it('numbers only the terms that have text', () => {
    const state = filledState()
    state.addendum.clauses = ['First term.', ' '.repeat(3), 'Second term.']

    const source = sourceOf(buildAddendumPdf(state, JsPdf))

    expect(source).toContain('1. First term.')
    expect(source).toContain('2. Second term.')
  })
})
