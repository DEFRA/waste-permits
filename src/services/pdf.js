'use strict'

const PdfMake = require('pdfmake')
const moment = require('moment')
const { BUSINESS_TRACKS } = require('../dynamics')

function checkIfStandardRules (application) {
  const { businessTrack } = application
  const { id } = Object.values(BUSINESS_TRACKS).find(({ dynamicsGuid }) => dynamicsGuid === businessTrack)
  return id.includes('standard rules')
}

const createPdfDocDefinition = (sections, application) => {
  const permitHeading = sections.find(({ headingId }) => headingId === 'section-permit-heading')
  const permitAuthor = sections.find(({ headingId }) => headingId === 'section-contact-name-heading')
  const title = 'Application for ' + permitHeading.answers.map(a => a.answer).join(' ')
  const timestamp = moment()

  const declarationList = [ 'a written management system will be in place before they start operating',
    'they were authorised to apply for the permit by the organisation or individual responsible',
    'the information they gave was true'
  ]

  if (checkIfStandardRules(application)) {
    declarationList.unshift('their operation meets the standard rules')
  }

  const declaration = [
    {
      text: 'Declaration',
      style: 'th'
    },
    [
      {
        text: 'The operator confirmed that:',
        style: 'td'
      },
      {
        'ul': declarationList
      }
    ]
  ]

  const body = sections.map(section => {
    return [
      {
        text: section.heading,
        style: 'th'
      },
      {
        text: section
          .answers
          .filter(a => typeof a.answer === 'string')
          .map(a => a.answer).join('\n'),
        style: 'td'
      }
    ]
  }).concat([declaration])
  return {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [ 25, 25, 25, 25 ],
    defaultStyle: {
      font: 'helvetica',
      fontSize: 12,
      lineHeight: 1.35,
      margin: [0, 0, 0, 6]
    },
    styles: {
      h1: {
        fontSize: 17,
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
      },
      td: {
        margin: [0, 3, 0, 3]
      }
    },
    info: {
      title,
      author: permitAuthor.answers.map(a => a.answer).join(' '),
      subject: 'Application for an Environmental Permit',
      keywords: 'environmental permit, environment agency, application',
      creator: 'Environment Agency',
      producer: 'GOV.UK',
      creationDate: timestamp.format('DD/MM/YYYY')
    },
    content: [
      { text: title, style: 'h1' },
      'Application reference: ' + application.applicationNumber,
      `Submitted on ${timestamp.format('DD MMM YYYY')} at ${timestamp.format('h:mma')}`,
      'This is the information submitted by the applicant. It has not been checked or duly made.',
      {
        table: {
          headerRows: 0,
          body: body
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
  createPDFStream: (sections, application) => {
    return printer
      .createPdfKitDocument(
        createPdfDocDefinition(sections, application)
      )
  },
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
