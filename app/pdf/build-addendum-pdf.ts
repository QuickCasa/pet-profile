import type { jsPDF as JsPdf } from 'jspdf'
import { describePet } from '../describe-pet.js'
import { formatDate } from '../format-date.js'
import { getTenantNames } from '../get-tenant-names.js'
import type { AppState, Pet } from '../types.js'
import { PdfWriter } from './pdf-writer.js'

const BLANK = '____________________'
const SIGNATURE_HEIGHT = 70

/**
 * The facts that identify a pet in a lease, as one line: the kind of animal,
 * breed, colour, weight and any ID numbers.
 *
 * @param {Pet} pet The pet.
 * @returns {string} Such as "Dog, Beagle, tan and white, 11 kg, microchip 985112".
 */
function identifyPet(pet: Pet): string {
  const wanted = new Set(['Animal', 'Breed', 'Colour and markings', 'Weight'])
  const facts = describePet(pet)
  const parts = facts
    .filter(fact => wanted.has(fact.label))
    .map(fact => fact.value)

  if (pet.microchip.trim() !== '') {
    parts.push(`microchip ${pet.microchip.trim()}`)
  }

  if (pet.licence.trim() !== '') {
    parts.push(`licence ${pet.licence.trim()}`)
  }

  if (pet.assistanceAnimal) {
    parts.push('service or support animal')
  }

  return parts.join(', ')
}

/**
 * Writes the charges, if the landlord entered any, and notes that service and
 * support animals aren't charged for.
 *
 * @param {PdfWriter} writer The writer.
 * @param {AppState} state The profile and addendum.
 */
function writeCharges(writer: PdfWriter, state: AppState): void {
  const { addendum, profile } = state
  const assistance = profile.pets.filter(pet => pet.assistanceAnimal)
  const everyPetIsAssistance = assistance.length === profile.pets.length
  const charges = everyPetIsAssistance
    ? []
    : [
        { label: 'Pet deposit', value: addendum.deposit.trim() },
        { label: 'One-time pet fee', value: addendum.fee.trim() },
        { label: 'Monthly pet rent', value: addendum.monthlyRent.trim() },
      ].filter(charge => charge.value !== '')

  if (charges.length === 0 && assistance.length === 0) {
    return
  }

  writer.heading('Charges')

  for (const charge of charges) {
    writer.fact(charge.label, charge.value)
  }

  if (assistance.length === 0) {
    return
  }

  const names = assistance.map(pet => pet.name.trim() || 'Unnamed pet')
  writer.text(
    `No deposit, fee or pet rent applies to ${names.join(', ')}, listed as a service or support animal.`,
  )
}

/**
 * Writes a signature block: the signer's name, then lines to sign and date.
 *
 * @param {PdfWriter} writer The writer.
 * @param {string} role Such as "Landlord" or "Tenant".
 * @param {string} name The signer's name, or blank to fill in by hand.
 */
function writeSignature(writer: PdfWriter, role: string, name: string): void {
  writer.ensureSpace(SIGNATURE_HEIGHT)
  writer.text(`${role}: ${name || BLANK}`, { bold: true })

  const signatureWidth = writer.width * 0.6
  writer.signatureLine('Signature', writer.left, signatureWidth)
  writer.signatureLine(
    'Date',
    writer.left + signatureWidth + 24,
    writer.width - signatureWidth - 24,
  )
  writer.space(52)
}

/**
 * Builds the pet addendum a landlord attaches to a lease, from the renter's
 * pet profile and the landlord's terms.
 *
 * @param {AppState} state The profile and addendum.
 * @param {typeof JsPdf} JsPdfConstructor The jsPDF class, loaded when it's needed.
 * @returns {JsPdf} The document, ready to save.
 */
function buildAddendumPdf(
  state: AppState,
  JsPdfConstructor: typeof JsPdf,
): JsPdf {
  const { addendum, profile } = state
  const pdf = new JsPdfConstructor({ unit: 'pt', format: 'letter' })
  const writer = new PdfWriter(pdf)
  const tenants = getTenantNames(state)
  const effectiveDate = formatDate(addendum.effectiveDate.trim())

  pdf.setProperties({ title: 'Pet addendum' })

  writer.text('Pet Addendum', { size: 24, bold: true })
  writer.space(8)
  writer.text(
    `This addendum is part of the lease between ${addendum.landlord.trim() || BLANK} (the landlord) and ${tenants.join(', ') || BLANK} (the tenant) for ${addendum.address.trim() || BLANK}. It takes effect on ${effectiveDate || BLANK}.`,
  )

  writer.heading('Pets')
  writer.text('The tenant may keep these pets at the property:')
  writer.space(4)

  for (const pet of profile.pets) {
    writer.text(pet.name.trim() || 'Unnamed pet', { bold: true })
    writer.text(identifyPet(pet))
    writer.space(4)
  }

  writeCharges(writer, state)

  writer.heading('Terms')

  const clauses = addendum.clauses
    .map(clause => clause.trim())
    .filter(clause => clause !== '')

  for (const [index, clause] of clauses.entries()) {
    writer.text(`${String(index + 1)}. ${clause}`)
    writer.space(4)
  }

  const signers = tenants.length > 0 ? tenants : ['']

  // Everyone signs on the same page, so no signature sits alone on a page
  // that could be swapped out.
  writer.ensureSpace(SIGNATURE_HEIGHT * (signers.length + 1) + 40)
  writer.heading('Signatures')
  writeSignature(writer, 'Landlord', addendum.landlord.trim())

  for (const tenant of signers) {
    writeSignature(writer, 'Tenant', tenant)
  }

  writer.footer('Pet addendum. ')

  return pdf
}

export { buildAddendumPdf }
