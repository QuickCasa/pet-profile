import './styles.css'
import { applyPetField } from './apply-pet-field.js'
import { renderClauses } from './clauses-editor.js'
import { DEFAULT_CLAUSES, PET_TRAITS } from './constants.js'
import { createPet } from './create-pet.js'
import { createState } from './create-state.js'
import { describeType } from './describe-pet.js'
import { downloadPdf } from './download-pdf.js'
import { buildAddendumPdf } from './pdf/build-addendum-pdf.js'
import { buildProfilePdf } from './pdf/build-profile-pdf.js'
import { renderPets, syncPetCard } from './pets-editor.js'
import { resizePhoto } from './resize-photo.js'
import { createShareLink, readShareLink } from './share-link.js'
import { clearSavedState, loadState, saveState } from './storage.js'
import { toFileName } from './to-file-name.js'
import type {
  AddendumTextField,
  AppState,
  PetLocation,
  PetTrait,
  ProfileTextField,
} from './types.js'

const PROFILE_FIELDS = new Set<string>([
  'owners',
  'phone',
  'email',
  'emergencyContact',
  'references',
  'insurance',
])

const ADDENDUM_FIELDS = new Set<string>([
  'landlord',
  'address',
  'tenants',
  'effectiveDate',
  'deposit',
  'fee',
  'monthlyRent',
])

/**
 * Finds an element the page can't work without.
 *
 * @param {string} id The element's id.
 * @param {new () => T} type The element class it must be.
 * @returns {T} The element.
 */
function getElement<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.querySelector(`#${id}`)

  if (!(element instanceof type)) {
    throw new TypeError(`The page is missing #${id}.`)
  }

  return element
}

const form = getElement('form', HTMLFormElement)
const petsContainer = getElement('pets', HTMLDivElement)
const petTemplate = getElement('pet-template', HTMLTemplateElement)
const clausesList = getElement('clauses', HTMLOListElement)
const addendumPets = getElement('addendum-pets', HTMLUListElement)
const charges = getElement('charges', HTMLDivElement)
const assistanceNote = getElement('assistance-note', HTMLParagraphElement)
const profileStatus = getElement('profile-status', HTMLParagraphElement)
const addendumStatus = getElement('addendum-status', HTMLParagraphElement)
const storageStatus = getElement('storage-status', HTMLParagraphElement)
const shareBanner = getElement('share-banner', HTMLDivElement)
const shareLinkField = getElement('share-link-field', HTMLLabelElement)
const shareLinkInput = getElement('share-link', HTMLInputElement)
const startOver = getElement('start-over', HTMLButtonElement)

let state: AppState = loadState()
const sharedProfile = readShareLink(location.hash)
let startOverArmed = false

/**
 * Saves the state, and says so once if the browser refuses.
 */
function save(): void {
  storageStatus.textContent = saveState(state)
    ? ''
    : "This browser couldn't save your changes, so download your PDFs before you leave the page."
}

/**
 * Lists the pets in the addendum section, and switches the charges off when
 * every pet is a service or support animal.
 */
function syncAddendum(): void {
  const { pets } = state.profile

  addendumPets.replaceChildren(
    ...pets.map((pet, index) => {
      const item = document.createElement('li')
      const name = pet.name.trim() || `Pet ${String(index + 1)}`
      const assistance = pet.assistanceAnimal
        ? ', service or support animal'
        : ''
      item.textContent = `${name}: ${describeType(pet)}${assistance}`
      return item
    }),
  )

  const assistance = pets.filter(pet => pet.assistanceAnimal)
  const everyPet = assistance.length === pets.length

  for (const input of charges.querySelectorAll('input')) {
    input.disabled = everyPet
  }

  assistanceNote.hidden = assistance.length === 0
  assistanceNote.textContent = everyPet
    ? 'Every pet is marked as a service or support animal, so the addendum has no charges.'
    : 'The addendum notes that no deposit, fee or pet rent applies to pets marked as service or support animals.'
}

/**
 * Copies the state into every field and redraws the pets and terms.
 */
function renderAll(): void {
  for (const control of form.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement
  >('[data-profile]')) {
    const field = control.dataset.profile ?? ''
    control.value = PROFILE_FIELDS.has(field)
      ? state.profile[field as ProfileTextField]
      : ''
  }

  for (const control of form.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement
  >('[data-addendum]')) {
    const field = control.dataset.addendum ?? ''
    control.value = ADDENDUM_FIELDS.has(field)
      ? state.addendum[field as AddendumTextField]
      : ''
  }

  renderPets(petsContainer, petTemplate, state.profile.pets)
  renderClauses(clausesList, state.addendum.clauses)
  syncAddendum()
}

/**
 * Finds the pet a control belongs to, from its card.
 *
 * @param {Element} control A control inside a pet card.
 * @returns {PetLocation | undefined} The card and the pet's position.
 */
function findPet(control: Element): PetLocation | undefined {
  const card = control.closest<HTMLElement>('.pet')
  const index = state.profile.pets.findIndex(
    pet => pet.id === card?.dataset.petId,
  )

  return card && index !== -1 ? { card, index } : undefined
}

form.addEventListener('submit', submitEvent => {
  submitEvent.preventDefault()
})

form.addEventListener('input', inputEvent => {
  const { target } = inputEvent

  if (!(
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  )) {
    return
  }

  const { addendum, clause, petField, petTrait, profile } = target.dataset

  if (profile && PROFILE_FIELDS.has(profile)) {
    state.profile[profile as ProfileTextField] = target.value
    syncAddendum()
  } else if (addendum && ADDENDUM_FIELDS.has(addendum)) {
    state.addendum[addendum as AddendumTextField] = target.value
  } else if (clause !== undefined) {
    state.addendum.clauses[Number(clause)] = target.value
  } else if (petField || petTrait) {
    const found = findPet(target)
    const pet = found ? state.profile.pets[found.index] : undefined

    if (!found || !pet) {
      return
    }

    if (petTrait && target instanceof HTMLInputElement) {
      if ((PET_TRAITS as readonly string[]).includes(petTrait)) {
        pet.traits[petTrait as PetTrait] = target.checked
      }
    } else if (petField) {
      applyPetField(pet, petField, target)
    }

    syncPetCard(found.card, pet, found.index)
    syncAddendum()
  } else {
    return
  }

  save()
})

form.addEventListener('change', async changeEvent => {
  const { target } = changeEvent

  if (
    !(target instanceof HTMLInputElement) ||
    target.dataset.action !== 'photo'
  ) {
    return
  }

  const [file] = target.files ?? []
  const found = findPet(target)
  const pet = found ? state.profile.pets[found.index] : undefined

  if (!file || !found || !pet) {
    return
  }

  try {
    pet.photo = await resizePhoto(file)
    syncPetCard(found.card, pet, found.index)
    profileStatus.textContent = ''
    save()
  } catch {
    profileStatus.textContent =
      "That file couldn't be opened as a photo. Try a JPEG or PNG."
  } finally {
    target.value = ''
  }
})

form.addEventListener('click', clickEvent => {
  const { target } = clickEvent

  if (!(target instanceof HTMLButtonElement)) {
    return
  }

  const { action, removeClause } = target.dataset

  if (action === 'remove-pet' || action === 'remove-photo') {
    const found = findPet(target)
    const pet = found ? state.profile.pets[found.index] : undefined

    if (!found || !pet) {
      return
    }

    if (action === 'remove-photo') {
      pet.photo = ''
      syncPetCard(found.card, pet, found.index)
    } else {
      state.profile.pets.splice(found.index, 1)
      renderPets(petsContainer, petTemplate, state.profile.pets)
      syncAddendum()
    }
  } else if (removeClause === undefined) {
    return
  } else {
    state.addendum.clauses.splice(Number(removeClause), 1)
    renderClauses(clausesList, state.addendum.clauses)
  }

  save()
})

getElement('add-pet', HTMLButtonElement).addEventListener('click', () => {
  state.profile.pets.push(createPet())
  renderPets(petsContainer, petTemplate, state.profile.pets)
  syncAddendum()
  save()
  petsContainer.lastElementChild
    ?.querySelector<HTMLInputElement>('[data-pet-field="name"]')
    ?.focus()
})

getElement('add-clause', HTMLButtonElement).addEventListener('click', () => {
  state.addendum.clauses.push('')
  renderClauses(clausesList, state.addendum.clauses)
  save()
  clausesList.lastElementChild?.querySelector('textarea')?.focus()
})

getElement('reset-clauses', HTMLButtonElement).addEventListener('click', () => {
  state.addendum.clauses = [...DEFAULT_CLAUSES]
  renderClauses(clausesList, state.addendum.clauses)
  save()
})

getElement('download-profile', HTMLButtonElement).addEventListener(
  'click',
  async () => {
    const names = state.profile.pets.map(pet => pet.name)
    profileStatus.textContent = ''

    try {
      await downloadPdf(
        JsPdf => buildProfilePdf(state.profile, JsPdf),
        toFileName('pet-profile', names),
      )
    } catch {
      profileStatus.textContent =
        "The PDF couldn't be made. Check your connection and try again."
    }
  },
)

getElement('download-addendum', HTMLButtonElement).addEventListener(
  'click',
  async () => {
    const names = state.profile.pets.map(pet => pet.name)
    addendumStatus.textContent = ''

    try {
      await downloadPdf(
        JsPdf => buildAddendumPdf(state, JsPdf),
        toFileName('pet-addendum', names),
      )
    } catch {
      addendumStatus.textContent =
        "The PDF couldn't be made. Check your connection and try again."
    }
  },
)

getElement('copy-link', HTMLButtonElement).addEventListener(
  'click',
  async () => {
    const link = createShareLink(
      state.profile,
      `${location.origin}${location.pathname}`,
    )
    const note =
      'Photos stay out of links, so send the PDF too if you want your landlord to see them.'

    shareLinkInput.value = link
    shareLinkField.hidden = false

    try {
      await navigator.clipboard.writeText(link)
      profileStatus.textContent = `Link copied. ${note}`
    } catch {
      shareLinkInput.select()
      profileStatus.textContent = `Copy the link below. ${note}`
    }
  },
)

startOver.addEventListener('click', () => {
  if (startOverArmed) {
    clearEverything()
    return
  }

  startOverArmed = true
  startOver.textContent = 'Click again to clear everything'
  setTimeout(() => {
    startOverArmed = false
    startOver.textContent = 'Start over'
  }, 5000)
})

/**
 * Clears the form and everything saved in this browser.
 */
function clearEverything(): void {
  startOverArmed = false
  startOver.textContent = 'Start over'
  state = createState()
  clearSavedState()
  renderAll()
  shareLinkField.hidden = true
  profileStatus.textContent = ''
  storageStatus.textContent = 'Cleared. Nothing is saved in this browser now.'
}

/**
 * Removes the shared profile from the address bar, so a reload doesn't offer
 * it again.
 */
function clearShareHash(): void {
  history.replaceState(null, '', `${location.pathname}${location.search}`)
  shareBanner.hidden = true
}

getElement('load-shared', HTMLButtonElement).addEventListener('click', () => {
  if (sharedProfile) {
    state.profile = sharedProfile
    renderAll()
    save()
  }

  clearShareHash()
})

getElement('ignore-shared', HTMLButtonElement).addEventListener(
  'click',
  clearShareHash,
)

shareBanner.hidden = sharedProfile === undefined
renderAll()
