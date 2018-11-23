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
const TaskList = require('../../../src/models/taskList/base.taskList')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox

const fakeSlug = 'SLUG'

const routePath = `/pay/result`
const nextRoutePath = `/done/${fakeSlug}`
const errorPath = '/errors/technical-problem'
const problemRoutePath = '/pay/card-problem/SLUG'

let fakeApplication
let fakeApplicationLine
let fakeApplicationReturn
let fakePayment
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
    applicationId: fakeApplication.id,
    slug: fakeSlug
  }

  fakePayment = {
    referenceNumber: 12345,
    status: 'success'
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: fakeApplicationLine.id,
    application: new Application(fakeApplication),
    applicationLine: new ApplicationLine(fakeApplicationLine),
    applicationReturn: new ApplicationReturn(fakeApplicationReturn),
    cardPayment: new Payment(fakePayment)
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => fakeApplication.submitted)
  sandbox.stub(Application.prototype, 'save').value(async () => undefined)
  sandbox.stub(Application, 'getById').value(async () => new Application(fakeApplication))
  sandbox.stub(ApplicationLine, 'getById').value(async () => new ApplicationLine(fakeApplicationLine))
  sandbox.stub(Payment.prototype, 'getCardPaymentResult').value(async () => fakePayment.status)
  sandbox.stub(TaskList, 'getTaskListClass').value(async () => TaskList)
  sandbox.stub(TaskList, 'isComplete').value(async () => true)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(async () => fakeRecovery())
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`Payment result:`, () => {
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
      lab.test('redirects to done', async () => {
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('redirects to card problem', async () => {
        fakePayment.status = 'problem'
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(`${problemRoutePath}?status=problem`)
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
