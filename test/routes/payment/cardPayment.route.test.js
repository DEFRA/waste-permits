'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const ApplicationReturn = require('../../../src/persistence/entities/applicationReturn.entity')
const Payment = require('../../../src/persistence/entities/payment.entity')
const StandardRule = require('../../../src/persistence/entities/standardRule.entity')
const TaskList = require('../../../src/models/taskList/base.taskList')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox

const slug = 'SLUG'
const paymentErrorStatus = 'error'

const routePath = `/pay/card`
const errorPath = '/errors/technical-problem'
const cardProblemPath = `/pay/card-problem/${slug}?status=${paymentErrorStatus}`
const returnFromGovPayUrl = '/return/from/govr/pay/url'

let fakeApplication
let fakeApplicationLine
let fakeApplicationReturn
let fakePayment
let fakePaymentResult
let fakeStandardRule
let fakeRecovery

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    submitted: false
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

  fakePaymentResult = {
    PaymentNextUrlHref: returnFromGovPayUrl
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
    standardRule: new StandardRule(fakeStandardRule),
    slug: 'SLUG'
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => fakeApplication.submitted)
  sandbox.stub(Payment.prototype, 'save').value(() => fakePayment.id)
  sandbox.stub(Payment.prototype, 'makeCardPayment').value(() => fakePaymentResult)
  sandbox.stub(Payment, 'getCardPaymentDetails').value(() => new Payment(fakePayment))
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(TaskList, 'isComplete').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`How do you want to pay?:`, () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeHtmlTests: true,
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    includeTasksNotCompleteTest: true
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

      lab.test('redirects to card problem when status is error', async () => {
        fakePaymentResult.PaymentStatus = paymentErrorStatus
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(cardProblemPath)
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
