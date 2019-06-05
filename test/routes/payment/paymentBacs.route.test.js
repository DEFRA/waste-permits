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

const fakeSlug = 'SLUG'

const routePath = '/pay/bacs'
const nextRoutePath = '/pay/bacs-proof'
const errorPath = '/errors/technical-problem'

let mocks
let sandbox
let getBacsPaymentStub
let saveBacsPaymentStub

lab.beforeEach(() => {
  mocks = new Mocks()

  mocks.context.slug = fakeSlug

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(async () => undefined)
  getBacsPaymentStub = sandbox.stub(Payment, 'getBacsPaymentDetails')
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

lab.experiment(`You have chosen to pay by bank transfer using Bacs:`, () => {
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

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Confirm you will pay by bank transfer using Bacs')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('I will pay by Bacs')

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'arrangement-information',
        'email-information'
      ])
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
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

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        saveBacsPaymentStub.rejects(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
