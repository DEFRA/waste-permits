'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const pdf = require('../../src/services/pdf')

const testSections = [
  {
    headingId: 'section-permit-heading',
    answers: [{ answer: 'test heading' }]
  },
  {
    headingId: 'section-contact-name-heading',
    answers: [{ answer: 'contact name' }]
  },
  {
    headingId: 'section-permit-holder-individual-heading',
    answers: [{ answer: '' }]
  }
]

const testApplication = { applicationNumber: '123' }

lab.experiment('pdf module tests:', () => {
  lab.test('module presents an simple interface', () => {
    Code.expect(pdf).to.be.an.object()
    Code.expect(pdf.createPDF).to.be.a.function()
  })

  lab.test('a document-definitino/json-template can be created', () => {
    Code.expect(pdf.createPdfDocDefinition).to.be.a.function()
    const result = pdf.createPdfDocDefinition(testSections, testApplication)
    Code.expect(result).to.be.an.object()
    Code.expect(result.info.title).to.equal('Application for test heading')
    Code.expect(result.info.author).to.equal('contact name')
  })

  lab.test('a pdf document/buffer can be created', async () => {
    const result = await pdf.createPDF(testSections, testApplication)
    Code.expect(result).to.be.a.buffer()
  })

  lab.test('handle errors gracefully', async () => {
    let error
    try {
      await pdf.createPDF()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('PDF render failed')
  })
})
