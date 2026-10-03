import type { jsPDF as JsPdf } from 'jspdf'
import { PET_TRAITS, TRAIT_LABELS } from '../constants.js'
import { describePet } from '../describe-pet.js'
import { splitLines } from '../split-lines.js'
import type { Pet, Profile } from '../types.js'
import { PdfWriter } from './pdf-writer.js'

const PHOTO_BOX = 150
const PHOTO_GAP = 18

/**
 * Writes one pet: its photo, if there is one, beside its facts, then its
 * temperament and the owner's notes.
 *
 * @param {PdfWriter} writer The writer.
 * @param {Pet} pet The pet.
 */
function writePet(writer: PdfWriter, pet: Pet): void {
  const facts = describePet(pet)
  const hasPhoto = pet.photo !== ''

  writer.heading(pet.name.trim() || 'Unnamed pet', 18)
  writer.ensureSpace(hasPhoto ? PHOTO_BOX : 40)

  const top = writer.y
  const photoBottom = hasPhoto
    ? writer.image(pet.photo, writer.left, top, PHOTO_BOX)
    : top
  const factsLeft = hasPhoto ? writer.left + PHOTO_BOX + PHOTO_GAP : writer.left

  for (const fact of facts) {
    writer.fact(fact.label, fact.value, factsLeft, hasPhoto ? 110 : 140)
  }

  writer.moveTo(photoBottom + 8)

  const traits = PET_TRAITS.filter(trait => pet.traits[trait]).map(
    trait => TRAIT_LABELS[trait],
  )

  if (traits.length > 0) {
    writer.space(6)
    writer.text('Temperament and training', {
      size: 9.5,
      bold: true,
      muted: true,
    })
    writer.text(traits.join(', '))
  }

  if (pet.notes.trim() === '') {
    return
  }

  writer.space(6)
  writer.text('From the owner', { size: 9.5, bold: true, muted: true })
  writer.text(pet.notes.trim())
}

/**
 * Writes a labelled block of free text, skipped when the field is blank.
 *
 * @param {PdfWriter} writer The writer.
 * @param {string} heading The block's heading.
 * @param {string} text The text.
 */
function writeSection(writer: PdfWriter, heading: string, text: string): void {
  if (text.trim() === '') {
    return
  }

  writer.heading(heading)
  writer.text(text.trim())
}

/**
 * Builds the pet profile a renter sends with a rental application.
 *
 * @param {Profile} profile The profile.
 * @param {typeof JsPdf} JsPdfConstructor The jsPDF class, loaded when it's needed.
 * @returns {JsPdf} The document, ready to save.
 */
function buildProfilePdf(
  profile: Profile,
  JsPdfConstructor: typeof JsPdf,
): JsPdf {
  const pdf = new JsPdfConstructor({ unit: 'pt', format: 'letter' })
  const writer = new PdfWriter(pdf)
  const owners = splitLines(profile.owners)
  const names = profile.pets.map(pet => pet.name.trim()).filter(Boolean)

  pdf.setProperties({
    title:
      names.length > 0 ? `Pet profile: ${names.join(', ')}` : 'Pet profile',
    creator: 'QuickCasa pet profile (quickcasa.github.io/pet-profile)',
  })

  writer.text('Pet profile', { size: 26, bold: true })
  writer.space(4)

  const contact = [
    owners.join(', '),
    profile.phone.trim(),
    profile.email.trim(),
  ]
    .filter(Boolean)
    .join('\n')

  if (contact !== '') {
    writer.text(contact, { muted: true })
  }

  for (const pet of profile.pets) {
    writer.space(10)
    writePet(writer, pet)
  }

  writeSection(
    writer,
    'Emergency contact for the pets',
    profile.emergencyContact,
  )
  writeSection(writer, 'References', profile.references)
  writeSection(writer, "Renter's insurance", profile.insurance)
  writer.footer(
    'Made with the free pet profile tool at quickcasa.github.io/pet-profile. ',
  )

  return pdf
}

export { buildProfilePdf }
