'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const Application = require('../../src/persistence/entities/application.entity')
const Payment = require('../../src/persistence/entities/payment.entity')
const ContactDetail = require('../../src/models/contactDetail.model')
const Configuration = require('../../src/persistence/entities/configuration.entity')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = `/done/slug`

let bacsPayment
let cardPayment
let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.application.paymentReceived = 1
  mocks.configuration.paymentsEmail = 'BACS_EMAIL'

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => true)
  sandbox.stub(ContactDetail, 'get').value(() => mocks.contactDetail)
  sandbox.stub(Payment, 'getBacsPayment').value(() => bacsPayment)
  sandbox.stub(Payment, 'getCardPayment').value(() => cardPayment)
  sandbox.stub(Configuration, 'getValue').value(() => mocks.configuration.paymentsEmail)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
  bacsPayment = undefined
  cardPayment = undefined
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
      Code.expect(doc.getElementById('application-name').firstChild.nodeValue).to.equal(mocks.application.applicationNumber)

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
      bacsPayment = mocks.payment
      const doc = await GeneralTestHelper.getDoc(request)

      checkCommonElements(doc)

      Code.expect(doc.getElementById('contact-email').firstChild.nodeValue).to.equal(`${mocks.contactDetail.email}.`)
      Code.expect(doc.getElementById('payment-reference').firstChild.nodeValue).to.equal(mocks.configuration.paymentReference)
      Code.expect(doc.getElementById('amount').firstChild.nodeValue).to.equal(mocks.configuration.amount)
      Code.expect(doc.getElementById('sort-code').firstChild.nodeValue).to.equal(mocks.configuration.sortCode)
      Code.expect(doc.getElementById('account-number').firstChild.nodeValue).to.equal(mocks.configuration.accountNumber)
      Code.expect(doc.getElementById('account-name').firstChild.nodeValue).to.equal(mocks.configuration.accountName)
      Code.expect(doc.getElementById('iban-number').firstChild.nodeValue).to.equal(mocks.configuration.ibanNumber)
      Code.expect(doc.getElementById('swift-number').firstChild.nodeValue).to.equal(mocks.configuration.swiftNumber)
      Code.expect(doc.getElementById('payments-email').firstChild.nodeValue).to.equal(mocks.configuration.paymentsEmail)
      Code.expect(doc.getElementById('payments-email-link').getAttribute('href')).to.equal(`mailto:${mocks.configuration.paymentsEmail}`)

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
      cardPayment = mocks.payment
      const doc = await GeneralTestHelper.getDoc(request)

      checkCommonElements(doc, 'Application and card payment received')

      Code.expect(doc.getElementById('payment-description').firstChild.nodeValue).to.equal(cardPayment.description)
      Code.expect(doc.getElementById('amount').firstChild.nodeValue).to.equal(mocks.configuration.amount)

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

    lab.test(`returns the application received page correctly even when the payment email hasn't been set`, async () => {
      bacsPayment = mocks.payment
      delete mocks.contactDetail.email

      const doc = await GeneralTestHelper.getDoc(request)

      Code.expect(doc.getElementById('contact-email').firstChild.nodeValue).to.equal('UNKNOWN EMAIL ADDRESS.')
    })
  })
})
