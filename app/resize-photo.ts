import { PHOTO_MAX_SIZE, PHOTO_QUALITY } from './constants.js'

/**
 * Scales a photo down to fit PHOTO_MAX_SIZE and re-encodes it as JPEG, so a
 * 12 megapixel phone photo becomes small enough to save in the browser and
 * still looks sharp in a PDF. The photo never leaves the device.
 *
 * @param {File} file The chosen image.
 * @returns {Promise<string>} The photo as a JPEG data URL.
 */
async function resizePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    PHOTO_MAX_SIZE / Math.max(bitmap.width, bitmap.height),
  )
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')

  if (context === null) {
    throw new Error("This browser can't process images.")
  }

  // JPEG has no transparency, so transparent areas get a white background
  // instead of black.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', PHOTO_QUALITY)
}

export { resizePhoto }
