'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const Contact = require('../../src/models/contact.model')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

let sandbox
const fakeSlug = 'SLUG'

let fakeApplication
let fakeApplicationLine
let fakePayment
let fakeContact
let fakeBacs
let fakeRecovery

const routePath = `/done/${fakeSlug}`

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER',
    paymentReceived: 1
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID'
  }

  fakePayment = {
    applicationId: fakeApplication.id,
    applicationLineId: 'APPLICATION_LINE_ID',
    value: 1000.99,
    description: 'THE PAYMENT DESCRIPTION'
  }

  fakeContact = {
    applicationId: fakeApplication.id,
    email: 'CONTACT_EMAIL'
  }

  fakeBacs = {
    paymentReference: `WP-${fakeApplication.applicationNumber}`,
    amount: '1,000.99',
    sortCode: '60-70-80',
    accountNumber: '1001 4411',
    accountName: 'EA RECEIPTS',
    ibanNumber: 'GB23NWK60708010014411',
    swiftNumber: 'NWBKGB2L',
    paymentsEmail: 'psc-bacs@environment-agency.gov.uk',
    description: 'THE DESCRIPTION'
  }

  fakeRecovery = () => ({
    slug: fakeSlug,
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: fakeApplicationLine.id,
    application: new Application(fakeApplication),
    contact: new Contact(fakeContact)
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => true)
  sandbox.stub(Payment, 'getBacsPayment').value(() => new Payment(fakePayment))
  sandbox.stub(Payment, 'getCardPayment').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('ApplicationReceived page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  lab.experiment(`GET ${routePath}`, () => {
    let request

    const checkCommonElements = async (doc, heading = 'Application received') => {
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(heading)
      Code.expect(doc.getElementById('application-name').firstChild.nodeValue).to.equal(fakeApplication.applicationNumber)

      return doc
    }

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('The page should not have a back link', async () => {
      const doc = await GeneralTestHelper.getDoc(request)
      Code.expect(doc.getElementById('back-link')).to.not.exist()
    })

    lab.test('returns the application received page correctly if bacs payment was selected', async () => {
      const doc = await GeneralTestHelper.getDoc(request)

      checkCommonElements(doc)

      Code.expect(doc.getElementById('contact-email').firstChild.nodeValue).to.equal(`${fakeContact.email}.`)
      Code.expect(doc.getElementById('payment-reference').firstChild.nodeValue).to.equal(fakeBacs.paymentReference)
      Code.expect(doc.getElementById('amount').firstChild.nodeValue).to.equal(fakeBacs.amount)
      Code.expect(doc.getElementById('sort-code').firstChild.nodeValue).to.equal(fakeBacs.sortCode)
      Code.expect(doc.getElementById('account-number').firstChild.nodeValue).to.equal(fakeBacs.accountNumber)
      Code.expect(doc.getElementById('account-name').firstChild.nodeValue).to.equal(fakeBacs.accountName)
      Code.expect(doc.getElementById('iban-number').firstChild.nodeValue).to.equal(fakeBacs.ibanNumber)
      Code.expect(doc.getElementById('swift-number').firstChild.nodeValue).to.equal(fakeBacs.swiftNumber)
      Code.expect(doc.getElementById('payments-email').firstChild.nodeValue).to.equal(fakeBacs.paymentsEmail)
      Code.expect(doc.getElementById('payments-email-link').getAttribute('href')).to.equal(`mailto:${fakeBacs.paymentsEmail}`)

      GeneralTestHelper.checkElementsExist(doc, [
        'reference-number-paragraph',
        'confirmation-email-message-prefix',
        'application-received-info',
        'application-received-hint',
        'application-received-warning',
        'when-we-get-your-payment-heading',
        'confirmation-email-message-suffix',
        'bacs-paragraph',
        'application-processing-payment-message',
        'pay-using-bacs-heading-1',
        'pay-using-bacs-heading-2',
        'payment-reference-heading',
        'amount-heading',
        'sort-code-heading',
        'account-number-heading',
        'account-name-heading',
        'iban-number-text',
        'swift-number-text',
        'swift-abbr',
        'payment-ref-text',
        'overseas-account-hint',
        'overseas-account-hint-paragraph-1',
        'overseas-account-hint-paragraph-2',
        'overseas-account-hint-paragraph-3',
        'payments-email-link',
        'confirm-your-payment-message',
        'give-feedback-link'
      ])
    })

    lab.test('returns the application received page correctly if card payment was selected', async () => {
      sandbox.stub(Payment, 'getBacsPayment').value(() => undefined)
      sandbox.stub(Payment, 'getCardPayment').value(() => new Payment(fakePayment))

      const doc = await GeneralTestHelper.getDoc(request)

      checkCommonElements(doc, 'Application and card payment received')

      Code.expect(doc.getElementById('payment-description').firstChild.nodeValue).to.equal(fakePayment.description)
      Code.expect(doc.getElementById('amount').firstChild.nodeValue).to.equal(fakeBacs.amount)

      GeneralTestHelper.checkElementsExist(doc, [
        'reference-number-paragraph',
        'emailed-receipt',
        'emailed-confirmation',
        'what-happens-next-heading',
        'application-received-info',
        'application-received-hint',
        'application-received-warning',
        'give-feedback-link'
      ])
    })
  })
})
