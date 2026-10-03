import { describe, expect, it } from 'vitest'
import { createPet } from '../app/create-pet.js'
import { createState } from '../app/create-state.js'
import { describePet } from '../app/describe-pet.js'
import { formatDate } from '../app/format-date.js'
import { getTenantNames } from '../app/get-tenant-names.js'
import { normalizeState } from '../app/normalize-state.js'
import { toPdfText } from '../app/pdf/to-pdf-text.js'
import { createShareLink, readShareLink } from '../app/share-link.js'
import { toFileName } from '../app/to-file-name.js'
import type { JsonValue } from '../app/types.js'

describe('share links', () => {
  it('round-trip a profile, accents included, without photos', () => {
    const state = createState()
    state.profile.owners = 'Zoë Tremblay'
    state.profile.pets = [
      {
        ...createPet(),
        name: 'Crème Brûlée',
        type: 'cat',
        photo: 'data:image/jpeg;base64,AAAA',
      },
    ]

    const link = createShareLink(state.profile, 'https://example.com/pets/')
    const profile = readShareLink(new URL(link).hash)

    expect(link.startsWith('https://example.com/pets/#profile=')).toBe(true)
    expect(profile?.owners).toBe('Zoë Tremblay')
    expect(profile?.pets[0]?.name).toBe('Crème Brûlée')
    expect(profile?.pets[0]?.type).toBe('cat')
    expect(profile?.pets[0]?.photo).toBe('')
  })

  it('ignore fragments that are not share links or that are damaged', () => {
    expect(readShareLink('')).toBeUndefined()
    expect(readShareLink('#section')).toBeUndefined()
    expect(readShareLink('#profile=%%%not-base64')).toBeUndefined()
  })
})

describe('normalizeState', () => {
  it('starts fresh when nothing was saved', () => {
    const state = normalizeState(undefined)

    expect(state.profile.pets).toHaveLength(1)
    expect(state.addendum.clauses.length).toBeGreaterThan(0)
  })

  it('keeps good fields and drops tampered ones', () => {
    const saved: JsonValue = {
      profile: {
        owners: 'Sam',
        phone: 42,
        pets: [
          {
            name: 'Rex',
            type: 'dragon',
            sex: 'male',
            traits: { houseTrained: true, goodWithCats: 'yes' },
            photo: 'data:image/svg+xml;base64,PHN2Zz4=',
          },
        ],
      },
      addendum: { clauses: ['Only this term.', 7], landlord: ['nope'] },
    }

    const state = normalizeState(saved)
    const [pet] = state.profile.pets

    expect(state.profile.owners).toBe('Sam')
    expect(state.profile.phone).toBe('')
    expect(pet?.type).toBe('dog')
    expect(pet?.sex).toBe('male')
    expect(pet?.traits.houseTrained).toBe(true)
    expect(pet?.traits.goodWithCats).toBe(false)
    expect(pet?.photo).toBe('')
    expect(state.addendum.clauses).toEqual(['Only this term.'])
    expect(state.addendum.landlord).toBe('')
  })
})

describe('describePet', () => {
  it('lists only what was filled in, in plain words', () => {
    const facts = describePet({
      ...createPet(),
      type: 'other',
      otherType: 'Rabbit',
      sex: 'male',
      spayedOrNeutered: 'yes',
      weight: '2.5',
      weightUnit: 'lb',
      rabiesDate: '2026-01-05',
    })

    expect(facts).toEqual([
      { label: 'Animal', value: 'Rabbit' },
      { label: 'Sex', value: 'Male, neutered' },
      { label: 'Weight', value: '2.5 lb' },
      { label: 'Rabies vaccine', value: 'January 5, 2026' },
    ])
  })

  it('describes spay or neuter status without a sex', () => {
    const facts = describePet({ ...createPet(), spayedOrNeutered: 'no' })

    expect(facts).toContainEqual({
      label: 'Sex',
      value: 'Not spayed or neutered',
    })
  })
})

describe('getTenantNames', () => {
  it("uses the landlord's list, or falls back to the profile's owners", () => {
    const state = createState()
    state.profile.owners = 'Jordan Lee\n\n  Sam Rivera  '

    expect(getTenantNames(state)).toEqual(['Jordan Lee', 'Sam Rivera'])

    state.addendum.tenants = 'Jordan Lee'

    expect(getTenantNames(state)).toEqual(['Jordan Lee'])
  })
})

describe('formatDate', () => {
  it('formats dates from a date input and leaves anything else alone', () => {
    expect(formatDate('2026-10-03')).toBe('October 3, 2026')
    expect(formatDate('next spring')).toBe('next spring')
    expect(formatDate('')).toBe('')
  })
})

describe('toPdfText', () => {
  it('keeps Western European text and replaces what the fonts cannot draw', () => {
    expect(toPdfText('Zoë’s café, €20')).toBe('Zoë’s café, €20')
    expect(toPdfText('Mochi 🐱 小猫')).toBe('Mochi ? ??')
  })
})

describe('toFileName', () => {
  it('builds a safe name from pet names', () => {
    expect(toFileName('pet-profile', ['Biscuit', 'Crème Brûlée'])).toBe(
      'pet-profile-biscuit-and-creme-brulee.pdf',
    )
    expect(toFileName('pet-addendum', ['', '  '])).toBe('pet-addendum.pdf')
  })
})
