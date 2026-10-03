import type { jsPDF as JsPdf } from 'jspdf'
import type { PdfTextOptions } from '../types.js'
import { toPdfText } from './to-pdf-text.js'

const PAGE_MARGIN = 54
const FOOTER_SPACE = 36
const BODY_SIZE = 11
const LINE_HEIGHT = 1.35
const MUTED = 90

/**
 * Lays text out top to bottom on US Letter pages, starting a new page
 * whenever the next block wouldn't fit. Every string passes through
 * toPdfText, because the built-in PDF fonts can't draw every character.
 */
class PdfWriter {
  private cursor = PAGE_MARGIN
  private readonly bottom: number
  readonly pdf: JsPdf
  readonly left = PAGE_MARGIN
  readonly width: number

  constructor(pdf: JsPdf) {
    this.pdf = pdf
    this.width = pdf.internal.pageSize.getWidth() - PAGE_MARGIN * 2
    this.bottom = pdf.internal.pageSize.getHeight() - PAGE_MARGIN - FOOTER_SPACE
  }

  /**
   * The current distance from the top of the page, in points.
   *
   * @returns {number} The cursor position.
   */
  get y(): number {
    return this.cursor
  }

  /**
   * Starts a new page if fewer than `height` points are left on this one.
   *
   * @param {number} height The space the next block needs.
   */
  ensureSpace(height: number): void {
    if (this.cursor + height <= this.bottom) {
      return
    }

    this.pdf.addPage()
    this.cursor = PAGE_MARGIN
  }

  /**
   * Moves the cursor down.
   *
   * @param {number} points The distance.
   */
  space(points: number): void {
    this.cursor += points
  }

  /**
   * Moves the cursor to a position on the current page, such as below a photo.
   *
   * @param {number} y The new position.
   */
  moveTo(y: number): void {
    this.cursor = Math.max(this.cursor, y)
  }

  /**
   * Writes wrapped text.
   *
   * @param {string} text The text. Line breaks are kept.
   * @param {PdfTextOptions} options How to set it.
   */
  text(text: string, options: PdfTextOptions = {}): void {
    const size = options.size ?? BODY_SIZE
    const lineHeight = size * LINE_HEIGHT
    const x = options.x ?? this.left
    const width = options.width ?? this.width - (x - this.left)

    this.pdf.setFont('helvetica', options.bold ? 'bold' : 'normal')
    this.pdf.setFontSize(size)
    this.pdf.setTextColor(options.muted ? MUTED : 0)

    const lines = this.pdf.splitTextToSize(toPdfText(text), width) as string[]

    for (const line of lines) {
      this.ensureSpace(lineHeight)
      this.pdf.text(line, x, this.cursor + size)
      this.cursor += lineHeight
    }
  }

  /**
   * Writes a section heading with space above it, kept on the same page as at
   * least a few lines of what follows.
   *
   * @param {string} text The heading.
   * @param {number} size The font size.
   */
  heading(text: string, size = 14): void {
    this.ensureSpace(size * 4)
    this.space(size * 0.6)
    this.text(text, { size, bold: true })
    this.space(4)
  }

  /**
   * Writes a label and value side by side, such as "Breed" and "Beagle".
   *
   * @param {string} label The label.
   * @param {string} value The value.
   * @param {number} x Where the label starts.
   * @param {number} labelWidth How much room the label gets.
   */
  fact(label: string, value: string, x = this.left, labelWidth = 130): void {
    const top = this.cursor

    this.text(label, {
      size: 9.5,
      bold: true,
      muted: true,
      x,
      width: labelWidth - 8,
    })
    const labelBottom = this.cursor
    this.cursor = top
    this.text(value, { x: x + labelWidth })
    this.cursor = Math.max(this.cursor, labelBottom) + 2
  }

  /**
   * Draws a line to sign or write on, with a label under it.
   *
   * @param {string} label What goes on the line, such as "Signature".
   * @param {number} x Where the line starts.
   * @param {number} width How long it is.
   */
  signatureLine(label: string, x: number, width: number): void {
    const lineY = this.cursor + 28

    this.pdf.setDrawColor(0)
    this.pdf.setLineWidth(0.75)
    this.pdf.line(x, lineY, x + width, lineY)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(9)
    this.pdf.setTextColor(MUTED)
    this.pdf.text(toPdfText(label), x, lineY + 12)
  }

  /**
   * Draws an image scaled to fit a box, keeping its proportions.
   *
   * @param {string} dataUrl The image, as a JPEG data URL.
   * @param {number} x The box's left edge.
   * @param {number} y The box's top edge.
   * @param {number} box The box's width and height.
   * @returns {number} The bottom of the drawn image.
   */
  image(dataUrl: string, x: number, y: number, box: number): number {
    const properties = this.pdf.getImageProperties(dataUrl)
    const scale = Math.min(box / properties.width, box / properties.height)
    const width = properties.width * scale
    const height = properties.height * scale

    this.pdf.addImage(dataUrl, 'JPEG', x, y, width, height)
    return y + height
  }

  /**
   * Writes a footer on every page, with the page number.
   *
   * @param {string} text The footer text, before the page number.
   */
  footer(text: string): void {
    const pageCount = this.pdf.getNumberOfPages()
    const footerY = this.pdf.internal.pageSize.getHeight() - PAGE_MARGIN

    for (let page = 1; page <= pageCount; page += 1) {
      this.pdf.setPage(page)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.setFontSize(8.5)
      this.pdf.setTextColor(MUTED)
      this.pdf.text(
        toPdfText(`${text}Page ${String(page)} of ${String(pageCount)}`),
        this.left,
        footerY,
      )
    }
  }
}

export { PdfWriter }
