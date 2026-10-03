import { SHARE_PREFIX } from './constants.js'
import { normalizeProfile } from './normalize-state.js'
import type { JsonValue, Profile } from './types.js'

/**
 * Encodes text as URL-safe base64, through UTF-8 so accented names survive.
 *
 * @param {string} text The text.
 * @returns {string} The encoded text.
 */
function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCodePoint(byte)
  }

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '')
}

/**
 * Decodes URL-safe base64 back to text.
 *
 * @param {string} encoded The encoded text.
 * @returns {string} The text.
 */
function fromBase64Url(encoded: string): string {
  const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/'))
  const bytes = Uint8Array.from(
    binary,
    character => character.codePointAt(0) ?? 0,
  )
  return new TextDecoder().decode(bytes)
}

/**
 * Builds a link that opens the page with this profile filled in. The profile
 * travels in the URL fragment, which browsers don't send to the server, and
 * photos are left out to keep the link short.
 *
 * @param {Profile} profile The profile to share.
 * @param {string} pageUrl The page's address, without a fragment.
 * @returns {string} The link.
 */
function createShareLink(profile: Profile, pageUrl: string): string {
  const shared: Profile = {
    ...profile,
    pets: profile.pets.map(pet => ({ ...pet, photo: '' })),
  }

  return `${pageUrl}${SHARE_PREFIX}${toBase64Url(JSON.stringify(shared))}`
}

/**
 * Reads a profile from a share link's fragment.
 *
 * @param {string} hash The URL fragment, including the #.
 * @returns {Profile | undefined} The profile, or undefined when the fragment isn't a share link or can't be read.
 */
function readShareLink(hash: string): Profile | undefined {
  if (!hash.startsWith(SHARE_PREFIX)) {
    return undefined
  }

  try {
    const text = fromBase64Url(hash.slice(SHARE_PREFIX.length))
    return normalizeProfile(JSON.parse(text) as JsonValue)
  } catch {
    return undefined
  }
}

export { createShareLink, readShareLink }
