'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const BaseCheck = require('../../../src/models/checkList/base.check')
const InvoiceCheck = require('../../../src/models/checkList/invoice.check')

const INVOICE_ADDRESS_LINE = 0
const INVOICE_CONTACT_LINE = 1

const prefix = 'section-invoice'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getContactDetails').value(async () => mocks.contactDetail)
  sandbox.stub(BaseCheck.prototype, 'getInvoiceAddress').value(async () => mocks.address)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Invoice Check tests:', () => {
  lab.test('ruleSetId works correctly', async () => {
    Code.expect(InvoiceCheck.task.ruleSetId).to.equal('defra_invoicingdetailsrequired')
  })

  lab.experiment('buildlines', () => {
    let check
    let lines

    lab.beforeEach(async () => {
      check = new InvoiceCheck()
      lines = await check.buildLines()
    })

    lab.test('(invoice address line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[INVOICE_ADDRESS_LINE]
      const linePrefix = `${prefix}-address`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = mocks.address
      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0: {
            Code.expect(answer).to.equal(`${buildingNameOrNumber}, ${addressLine1}`)
            break
          }
          case 1: {
            Code.expect(answer).to.equal(addressLine2)
            break
          }
          case 2: {
            Code.expect(answer).to.equal(townOrCity)
            break
          }
          case 3: {
            Code.expect(answer).to.equal(postcode)
            break
          }
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/invoice/address/postcode')
      Code.expect(linkType).to.equal('invoice address')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })

    lab.test('(invoice contact line) works correctly', async () => {
      const { heading, headingId, answers, links } = lines[INVOICE_CONTACT_LINE]
      const linePrefix = `${prefix}-contact`
      Code.expect(heading).to.equal(heading)
      Code.expect(headingId).to.equal(`${linePrefix}-heading`)

      const { firstName, lastName, email, telephone } = mocks.contactDetail
      answers.forEach(({ answer, answerId }, answerIndex) => {
        Code.expect(answerId).to.equal(`${linePrefix}-answer-${answerIndex + 1}`)
        switch (answerIndex) {
          case 0: {
            Code.expect(answer).to.equal(`${firstName} ${lastName}`)
            break
          }
          case 1: {
            Code.expect(answer).to.equal(email)
            break
          }
          case 2: {
            Code.expect(answer).to.equal(`Telephone: ${telephone}`)
            break
          }
        }
      })

      const { link, linkId, linkType } = links.pop()
      Code.expect(link).to.equal('/invoice/contact')
      Code.expect(linkType).to.equal('invoice contact')
      Code.expect(linkId).to.equal(`${linePrefix}-link`)
    })
  })
})
