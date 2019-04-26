'use strict'

const PdfMake = require('pdfmake')
const moment = require('moment')

const createPdfDocDefinition = (sections, application) => {
  const permitHeading = sections.find(({ headingId }) => headingId === 'section-permit-heading')
  const permitAuthor = sections.find(({ headingId }) => headingId === 'section-contact-name-heading')
  const title = 'Application for ' + permitHeading.answers.map(a => a.answer).join(' ')
  return {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [ 25, 25, 25, 25 ],
    defaultStyle: {
      font: 'helvetica',
      fontSize: 12,
      margin: [0, 0, 0, 6]
    },
    styles: {
      h1: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 12]
      },
      h2: {
        fontSize: 14,
        bold: true,
        margin: [0, 12, 0, 6]
      },
      tableApplication: {
        margin: [0, 12, 0, 12]
      },
      th: {
        bold: true,
        margin: [0, 3, 0, 3]
      }
    },
    info: {
      title,
      author: permitAuthor.answers.map(a => a.answer).join(' '),
      subject: 'Application for an Environmental Permit',
      creator: 'GOV.UK',
      producer: 'GOV.UK',
      creationDate: moment().format('DD/MM/YYYY')
    },
    content: [
      { text: title, style: 'h1' },
      'Application reference: ' + application.applicationNumber,
      'Submitted on ' + moment().format('Do MMM YYYY'),
      {
        table: {
          headerRows: 0,
          body: sections.map(section => {
            return [
              {
                text: section.heading,
                style: 'th'
              },
              section
                .answers
                .filter(a => typeof a.answer === 'string')
                .map(a => a.answer)
            ]
          })
        },
        style: 'tableApplication',
        layout: 'lightHorizontalLines'
      }
    ]
  }
}

const printer = new PdfMake({
  helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
  timesRoman: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic'
  }
})

module.exports = {
  createPdfDocDefinition: createPdfDocDefinition,
  createPDF: async (sections, application) => {
    try {
      const doc = printer
        .createPdfKitDocument(createPdfDocDefinition(sections, application))

      let chunks = []

      doc.on('readable', function () {
        let chunk
        while ((chunk = doc.read(9007199254740991)) !== null) {
          chunks.push(chunk)
        }
      })

      const end = new Promise(function (resolve, reject) {
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)
      })

      doc.end()

      return end
    } catch (err) {
      throw Error('PDF render failed', err)
    }
  }
}
