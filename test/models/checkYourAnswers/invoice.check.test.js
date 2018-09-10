'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const InvoiceCheck = require('../../../src/models/checkYourAnswers/invoice.check')

const INVOICE_ADDRESS_LINE = 0

const fakeInvoiceAddress = {
  fromAddressLookup: true,
  buildingNameOrNumber: 'BUILDING_NAME_OR_NUMBER',
  addressLine1: 'ADDRESS_LINE_1',
  addressLine2: 'ADDRESS_LINE_2',
  townOrCity: 'TOWN_OR_CITY',
  postcode: 'POSTCODE'
}

const fakeBillingInvoicingDetail = {
  id: 'BILLING_INVOICING_DETAIL_ID'
}

const prefix = 'section-invoice'

let sandbox

lab.beforeEach(() => {
  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous base methods
  sandbox.stub(BaseCheck.prototype, 'getBillingInvoicingDetails').value(() => Merge({}, fakeBillingInvoicingDetail))
  sandbox.stub(BaseCheck.prototype, 'getInvoiceAddress').value(() => Merge({}, fakeInvoiceAddress))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()
})

lab.experiment('Invoice Check tests:', () => {
  lab.test('rulesetId works correctly', async () => {
    Code.expect(InvoiceCheck.rulesetId).to.equal('defra_invoicingdetailsrequired')
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

      const { buildingNameOrNumber, addressLine1, addressLine2, townOrCity, postcode } = fakeInvoiceAddress
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
  })
})
