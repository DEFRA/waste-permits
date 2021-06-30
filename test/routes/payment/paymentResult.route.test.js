'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const Payment = require('../../../src/persistence/entities/payment.entity')
const TaskList = require('../../../src/models/taskList/base.taskList')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

let mocks
let sandbox

const fakeSlug = 'SLUG'

const routePath = '/pay/result'
const nextRoutePath = `/done/${fakeSlug}`
const problemRoutePath = '/pay/card-problem/SLUG'

lab.beforeEach(() => {
  mocks = new Mocks()

  mocks.context.slug = fakeSlug
  mocks.context.cardPayment = mocks.payment

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => mocks.application.submitted)
  sandbox.stub(Application.prototype, 'save').value(async () => undefined)
  sandbox.stub(Payment.prototype, 'getCardPaymentResult').value(async () => mocks.payment.status)
  sandbox.stub(TaskList, 'getTaskListClass').value(async () => TaskList)
  sandbox.stub(TaskList, 'isComplete').value(async () => true)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(async () => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Payment result:', () => {
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
        mocks.payment.status = 'success'
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test('redirects to card problem', async () => {
        mocks.payment.status = 'problem'
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(`${problemRoutePath}?status=problem`)
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
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })
})
