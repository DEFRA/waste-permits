'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const Payment = require('../../../src/persistence/entities/payment.entity')
const TaskList = require('../../../src/models/taskList/taskList')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox

const fakeSlug = 'SLUG'

const routePath = '/pay/bacs'
const nextRoutePath = `/done/${fakeSlug}`
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeApplicationLine
let fakePayment
let fakeRecovery
let getRequest

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID',
    value: 'VALUE'
  }

  fakePayment = {
    applicationId: 'APPLICATION_ID',
    applicationLineId: 'APPLICATION_LINE_ID',
    category: 'CATEGORY',
    statusCode: 'STATUS_CODE',
    type: 'TYPE',
    value: 'VALUE'
  }

  fakeRecovery = () => ({
    slug: fakeSlug,
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: fakeApplicationLine.id,
    application: new Application(fakeApplication),
    applicationLine: new ApplicationLine(fakeApplicationLine)
  })

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(Payment, 'getBacsPaymentDetails').value(() => new Payment(fakePayment))
  sandbox.stub(Payment.prototype, 'save').value(() => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(TaskList, 'isComplete').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`You have chosen to pay by bank transfer using Bacs:`, () => {
  new GeneralTestHelper({ lab, routePath }).test({ includeTasksNotCompleteTest: true })

  lab.experiment(`GET ${routePath}`, () => {
    let doc

    lab.beforeEach(() => { })

    lab.test('success', async () => {
      doc = await GeneralTestHelper.getDoc(getRequest)

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('You have chosen to pay by bank transfer using Bacs')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Send application')

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
        Payment.getBacsPaymentDetails = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Payment.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
