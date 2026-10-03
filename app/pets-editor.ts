import { PET_TRAITS } from './constants.js'
import type { Pet } from './types.js'

/**
 * Updates the parts of a pet card that depend on its values: the title, the
 * photo and the "what kind of animal" field.
 *
 * @param {HTMLElement} card The pet's card.
 * @param {Pet} pet The pet.
 * @param {number} index The pet's position, for the title of an unnamed pet.
 */
function syncPetCard(card: HTMLElement, pet: Pet, index: number): void {
  const title = card.querySelector('.pet-title')
  const preview = card.querySelector<HTMLImageElement>('.photo-preview')
  const empty = card.querySelector<HTMLElement>('.photo-empty')
  const removePhoto = card.querySelector<HTMLElement>(
    '[data-action="remove-photo"]',
  )
  const photoLabel = card.querySelector('.photo-button-label')
  const otherType = card.querySelector<HTMLElement>('.other-type')
  const name = pet.name.trim()

  if (title) {
    title.textContent = name || `Pet ${String(index + 1)}`
  }

  if (preview && empty && removePhoto && photoLabel) {
    preview.hidden = pet.photo === ''
    empty.hidden = pet.photo !== ''
    removePhoto.hidden = pet.photo === ''
    photoLabel.textContent = pet.photo === '' ? 'Add a photo' : 'Change photo'

    if (pet.photo === '') {
      preview.removeAttribute('src')
    } else {
      preview.src = pet.photo
      preview.alt = name ? `Photo of ${name}` : 'Photo of this pet'
    }
  }

  if (otherType) {
    otherType.hidden = pet.type !== 'other'
  }
}

/**
 * Draws a card for each pet from the page's template and fills in its
 * values. Values are set as properties, never as HTML, so nothing an owner
 * types can change the page.
 *
 * @param {HTMLElement} container Where the cards go.
 * @param {HTMLTemplateElement} template The card template.
 * @param {readonly Pet[]} pets The pets.
 */
function renderPets(
  container: HTMLElement,
  template: HTMLTemplateElement,
  pets: readonly Pet[],
): void {
  const cards = pets.map((pet, index) => {
    const fragment = template.content.cloneNode(true) as DocumentFragment
    const card = fragment.querySelector<HTMLElement>('.pet')

    if (card === null) {
      throw new Error('The pet template is missing its card.')
    }

    card.dataset.petId = pet.id

    for (const control of card.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('[data-pet-field]')) {
      const field = control.dataset.petField ?? ''

      if (control instanceof HTMLInputElement && control.type === 'checkbox') {
        control.checked = field === 'assistanceAnimal' && pet.assistanceAnimal
      } else {
        const value: Pet[keyof Pet] | undefined = pet[field as keyof Pet]
        control.value = typeof value === 'string' ? value : ''
      }
    }

    for (const trait of PET_TRAITS) {
      const checkbox = card.querySelector<HTMLInputElement>(
        `[data-pet-trait="${CSS.escape(trait)}"]`,
      )

      if (checkbox) {
        checkbox.checked = pet.traits[trait]
      }
    }

    const remove = card.querySelector<HTMLElement>('[data-action="remove-pet"]')

    if (remove) {
      remove.hidden = pets.length === 1
      remove.setAttribute('aria-label', `Remove pet ${String(index + 1)}`)
    }

    syncPetCard(card, pet, index)
    return card
  })

  container.replaceChildren(...cards)
}

export { renderPets, syncPetCard }
