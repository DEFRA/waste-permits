'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const pdf = require('../../src/services/pdf')

lab.experiment('pdf module tests:', () => {
  lab.test('module presents an simple interface', () => {
    Code.expect(pdf).to.be.an.object()
    Code.expect(pdf.createPDF).to.be.a.function()
  })
  lab.test('a document-definitino/json-template can be created', () => {
    console.log(pdf.createPdfDocDefinition)
    Code.expect(pdf.createPdfDocDefinition).to.be.a.function()
    const result = pdf.createPdfDocDefinition([
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
    ], { applicationNumber: '123' })
    Code.expect(result).to.be.an.object()
    Code.expect(result.info.title).to.equal('Application for test heading')
    Code.expect(result.info.author).to.equal('contact name')
  })
})
