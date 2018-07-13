'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/models/application.model')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const ApplicationReturn = require('../../../src/models/applicationReturn.model')
const Payment = require('../../../src/models/payment.model')
const StandardRule = require('../../../src/models/standardRule.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const {COOKIE_RESULT} = require('../../../src/constants')

let sandbox

const routePath = `/pay/card`
const errorPath = '/errors/technical-problem'
const notSubmittedRoutePath = '/errors/order/check-answers-not-complete'
const returnFromGovPayUrl = '/return/from/govr/pay/url'

let fakeApplication
let fakeApplicationLine
let fakeApplicationReturn
let fakePayment
let fakeStandardRule
let fakeRecovery

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    submitted: true
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID'
  }

  fakeApplicationReturn = {
    applicationId: fakeApplication.id
  }

  fakePayment = {
    referenceNumber: 12345,
    returnUrl: returnFromGovPayUrl
  }

  fakeStandardRule = {
    permitName: 'STANDARD_RULE_NAME',
    code: 'SR2015 No 18'
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: fakeApplicationLine.id,
    application: new Application(fakeApplication),
    applicationLine: new ApplicationLine(fakeApplicationLine),
    applicationReturn: new ApplicationReturn(fakeApplicationReturn),
    standardRule: new StandardRule(fakeStandardRule)
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => fakeApplication.submitted)
  sandbox.stub(Payment.prototype, 'save').value(() => fakePayment.id)
  sandbox.stub(Payment.prototype, 'makeCardPayment').value(() => fakePayment.returnUrl)
  sandbox.stub(Payment, 'getCardPaymentDetails').value(() => new Payment(fakePayment))
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`How do you want to pay?:`, () => {
  new GeneralTestHelper(lab, routePath).test({
    excludeAlreadySubmittedTest: true,
    excludeHtmlTests: true,
    excludeCookieGetTests: true,
    excludeCookiePostTests: true
  })

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('redirects to returnUrl', async () => {
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(returnFromGovPayUrl)
      })

      lab.test('redirects when application not submitted', async () => {
        fakeApplication.submitted = false
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(notSubmittedRoutePath)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the applicationContext', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
