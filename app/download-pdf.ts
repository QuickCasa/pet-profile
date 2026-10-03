import type { jsPDF as JsPdf } from 'jspdf'

/**
 * Loads jsPDF only when someone downloads a PDF, so the page itself stays
 * small, then builds the document and saves it.
 *
 * @param {(constructor: typeof JsPdf) => JsPdf} build Builds the document.
 * @param {string} fileName The file name to save as.
 * @returns {Promise<void>} Resolves once the download has started.
 */
async function downloadPdf(
  build: (constructor: typeof JsPdf) => JsPdf,
  fileName: string,
): Promise<void> {
  const { jsPDF: JsPdfConstructor } = await import('jspdf')
  build(JsPdfConstructor).save(fileName)
}

export { downloadPdf }
