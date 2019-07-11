'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const Configuration = require('../../../src/persistence/entities/configuration.entity')
const Payment = require('../../../src/persistence/entities/payment.entity')
const StandardRuleType = require('../../../src/persistence/entities/standardRuleType.entity')
const TaskList = require('../../../src/models/taskList/base.taskList')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const fakeSlug = 'SLUG'

const routePath = '/pay/bacs-proof'
const nextRoutePath = `/done/${fakeSlug}`
const errorPath = '/errors/technical-problem'

let mocks
let sandbox
let getStandardRuleTypeStub
let getBacsPaymentStub
let saveBacsPaymentStub

const checkCommonElements = (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Give proof of your Bacs payment before you send your application')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Send application')
}

lab.beforeEach(() => {
  mocks = new Mocks()

  mocks.context.slug = fakeSlug

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  // sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Configuration, 'getValue').value(() => mocks.configuration.paymentsEmail)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(async () => undefined)
  getStandardRuleTypeStub = sandbox.stub(StandardRuleType, 'getById')
  getStandardRuleTypeStub.resolves(mocks.standardRuleType)
  getBacsPaymentStub = sandbox.stub(Payment, 'getBacsPayment')
  getBacsPaymentStub.resolves(mocks.payment)
  saveBacsPaymentStub = sandbox.stub(Payment.prototype, 'save')
  saveBacsPaymentStub.resolves(undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(TaskList, 'getTaskListClass').value(async () => TaskList)
  sandbox.stub(TaskList, 'isComplete').value(async () => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`Give proof of your Bacs payment:`, () => {
  new GeneralTestHelper({ lab, routePath }).test({ includeTasksNotCompleteTest: true })

  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('success', async () => {
      doc = await GeneralTestHelper.getDoc(getRequest)

      checkCommonElements(doc)

      Code.expect(doc.getElementById('bacs-payment-reference').firstChild.nodeValue).to.equal(mocks.configuration.paymentReference)
      Code.expect(doc.getElementById('amount').firstChild.nodeValue).to.equal(mocks.configuration.amount)
      Code.expect(doc.getElementById('sort-code').firstChild.nodeValue).to.equal(mocks.configuration.sortCode)
      Code.expect(doc.getElementById('account-number').firstChild.nodeValue).to.equal(mocks.configuration.accountNumber)
      Code.expect(doc.getElementById('account-name').firstChild.nodeValue).to.equal(mocks.configuration.accountName)
      Code.expect(doc.getElementById('iban-number').firstChild.nodeValue).to.equal(mocks.configuration.ibanNumber)
      Code.expect(doc.getElementById('swift-number').firstChild.nodeValue).to.equal(mocks.configuration.swiftNumber)
    })

    lab.test('success for standard rules MCP', async () => {
      mocks.context.isMcp = true
      getStandardRuleTypeStub.resolves(mocks.standardRuleTypeForMcp)
      doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('bacs-payment-reference').firstChild.nodeValue).to.equal(mocks.configurationForMcp.paymentReference)
    })

    lab.test('success for bespoke MCP', async () => {
      mocks.context.isMcp = true
      mocks.context.isBespoke = true
      getStandardRuleTypeStub.resolves(mocks.standardRuleTypeForMcp)
      doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('bacs-payment-reference').firstChild.nodeValue).to.equal(mocks.configurationForMcp.paymentReference)
    })

    lab.test('failure when no payment details', async () => {
      const spy = sandbox.spy(LoggingService, 'logError')
      getBacsPaymentStub.resolves(undefined)

      const res = await server.inject(getRequest)
      Code.expect(spy.callCount).to.equal(1)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(errorPath)
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'date-paid-day': '1',
          'date-paid-month': '1',
          'date-paid-year': '2000',
          'amount-paid': '£9,999.99',
          'payment-reference': 'REF'
        }
      }
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the payment details', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        getBacsPaymentStub.rejects(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when no payment details', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        getBacsPaymentStub.resolves(undefined)

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        saveBacsPaymentStub.rejects(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when no values entered', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'date-paid-day', 'Enter a valid date', false, 0)
        GeneralTestHelper.checkValidationMessage(doc, 'amount-paid', 'Enter the amount paid', false, 1)
        GeneralTestHelper.checkValidationMessage(doc, 'payment-reference', 'Enter a payment reference', false, 2)
      })
      lab.test('when no day', async () => {
        postRequest.payload['date-paid-day'] = ''
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'date-paid-day', 'Enter a valid date')
      })
      lab.test('when no month', async () => {
        postRequest.payload['date-paid-month'] = ''
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'date-paid-day', 'Enter a valid date')
      })
      lab.test('when no year', async () => {
        postRequest.payload['date-paid-year'] = ''
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'date-paid-day', 'Enter a valid date')
      })
      lab.test('when not real date', async () => {
        postRequest.payload['date-paid-month'] = '13'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'date-paid-day', 'Enter a valid date')
      })
      lab.test('when later than today', async () => {
        const tomorrow = new Date(Date.now() + 86400000)
        postRequest.payload['date-paid-day'] = `${tomorrow.getDate()}`
        postRequest.payload['date-paid-month'] = `${tomorrow.getMonth() + 1}`
        postRequest.payload['date-paid-year'] = `${tomorrow.getFullYear()}`
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'date-paid-day', 'Date cannot be in the future. You must pay before you send the application.')
      })
      lab.test('when amount is not a number', async () => {
        postRequest.payload['amount-paid'] = 'X'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'amount-paid', 'Enter an amount of money')
      })
      lab.test('when amount has too many decimal places', async () => {
        postRequest.payload['amount-paid'] = '£9,999.999'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'amount-paid', 'Enter the amount with a maximum of two decimal places')
      })
      lab.test('when reference is too long', async () => {
        postRequest.payload['payment-reference'] = 'X'.repeat(31)
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        GeneralTestHelper.checkValidationMessage(doc, 'payment-reference', 'Enter a payment reference with no more than 30 characters')
      })
    })
  })
})
