'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const Contact = require('../../src/models/contact.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

let fakeApplication
let fakePayment
let fakeContact
let fakeBacs

const routePath = '/done'

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationName: 'APPLICATION_NAME',
    paymentReceived: 1
  }

  fakePayment = {
    applicationId: fakeApplication.id,
    applicationLineId: 'APPLICATION_LINE_ID',
    value: 1000.99
  }

  fakeContact = {
    applicationId: fakeApplication.id,
    email: 'CONTACT_EMAIL'
  }

  fakeBacs = {
    paymentReference: `WP-${fakeApplication.applicationName}`,
    amount: '1,000.99',
    sortCode: '60-70-80',
    accountNumber: '1001 4411',
    ibanNumber: 'GB23NWK60708010014411',
    swiftNumber: 'NWBKGB2L',
    paymentsEmail: 'psc-bacs@environment-agency.gov.uk'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Contact, 'getByApplicationId').value(() => new Contact(fakeContact))
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => new Payment(fakePayment))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('ApplicationReceived page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(false, true, true)

  lab.experiment(`GET ${routePath}`, () => {
    let request

    const getDoc = async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      return parser.parseFromString(res.payload, 'text/html')
    }

    const checkCommonElements = async (doc) => {
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Application received')
      Code.expect(doc.getElementById('application-name').firstChild.nodeValue).to.equal(fakeApplication.applicationName)
      Code.expect(doc.getElementById('contact-email').firstChild.nodeValue).to.equal(fakeContact.email)

      GeneralTestHelper.checkElementsExist(doc, [
        'reference-number-paragraph',
        'confirmation-email-message-prefix',
        'application-received-info',
        'application-received-hint',
        'application-received-warning'
      ])

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
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('back-link')).to.not.exist()
    })

    lab.test('returns the application received page correctly if bacs has been selected for payment eventhough the application has not been paid for yet', async () => {
      fakeApplication.paymentReceived = 0

      const doc = await getDoc()

      checkCommonElements(doc)

      Code.expect(doc.getElementById('payment-reference').firstChild.nodeValue).to.equal(fakeBacs.paymentReference)
      Code.expect(doc.getElementById('amount').firstChild.nodeValue).to.equal(fakeBacs.amount)
      Code.expect(doc.getElementById('sort-code').firstChild.nodeValue).to.equal(fakeBacs.sortCode)
      Code.expect(doc.getElementById('account-number').firstChild.nodeValue).to.equal(fakeBacs.accountNumber)
      Code.expect(doc.getElementById('iban-number').firstChild.nodeValue).to.equal(fakeBacs.ibanNumber)
      Code.expect(doc.getElementById('swift-number').firstChild.nodeValue).to.equal(fakeBacs.swiftNumber)
      Code.expect(doc.getElementById('payments-email').firstChild.nodeValue).to.equal(fakeBacs.paymentsEmail)
      Code.expect(doc.getElementById('payments-email-link').getAttribute('href')).to.equal(`mailto:${fakeBacs.paymentsEmail}`)

      GeneralTestHelper.checkElementsExist(doc, [
        'when-we-get-your-payment-heading',
        'confirmation-email-message-suffix',
        'bacs-paragraph',
        'application-processing-payment-message',
        'pay-using-bacs-heading',
        'payment-reference-heading',
        'amount-heading',
        'sort-code-heading',
        'account-number-heading',
        'iban-number-text',
        'swift-number-text',
        'payment-ref-text',
        'overseas-account-hint',
        'overseas-account-hint-paragraph-1',
        'overseas-account-hint-paragraph-2',
        'overseas-account-hint-paragraph-3',
        'payments-email-link',
        'confirm-your-payment-message'
      ])

      Code.expect(doc.getElementById('what-happens-next-heading')).to.not.exist()
    })

    lab.test('returns the application received page correctly if bacs has not been selected for payment but the application has been paid for', async () => {
      Payment.getByApplicationLineIdAndType = () => undefined
      const doc = await getDoc()

      checkCommonElements(doc)

      Code.expect(doc.getElementById('what-happens-next-heading')).to.exist()

      GeneralTestHelper.checkElementsDoNotExist(doc, [
        'when-we-get-your-payment-heading',
        'confirmation-email-message-suffix',
        'bacs-paragraph',
        'application-processing-payment-message',
        'pay-using-bacs-heading',
        'payment-reference-heading',
        'amount-heading',
        'sort-code-heading',
        'account-number-heading',
        'payment-reference',
        'payment-email',
        'sort-code',
        'account-number',
        'iban-number-text',
        'swift-number-text',
        'payment-ref-text',
        'iban-number',
        'swift-number',
        'payments-email',
        'payments-email-link',
        'overseas-account-hint',
        'overseas-account-hint-paragraph-1',
        'overseas-account-hint-paragraph-2',
        'overseas-account-hint-paragraph-3',
        'confirm-your-payment-message'
      ])
    })

    lab.test('Redirects to the Not Paid screen if bacs has not been selected for payment and the application has not been paid for yet', async () => {
      Payment.getByApplicationLineIdAndType = () => undefined
      fakeApplication.paymentReceived = 0

      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/errors/order/card-payment-not-complete')
    })
  })
})
