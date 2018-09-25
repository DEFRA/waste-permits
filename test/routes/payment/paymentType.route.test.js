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
const TaskList = require('../../../src/models/taskList/taskList')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const PaymentTypes = {
  CARD_PAYMENT: 910400000,
  BACS_PAYMENT: 910400005
}

let sandbox

const fakeSlug = 'SLUG'

const routePath = `/pay/type`
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeApplicationLine
let fakeApplicationReturn
let fakeRecovery

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID'
  }

  fakeApplicationReturn = {
    applicationId: fakeApplication.id,
    slug: fakeSlug
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: fakeApplicationLine.id,
    application: new Application(fakeApplication),
    applicationLine: new ApplicationLine(fakeApplicationLine),
    applicationReturn: new ApplicationReturn(fakeApplicationReturn)
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(ApplicationLine, 'getById').value(() => new ApplicationLine(fakeApplicationLine))
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(TaskList, 'isComplete').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`How do you want to pay?:`, () => {
  new GeneralTestHelper({ lab, routePath }).test({ includeTasksNotCompleteTest: true })

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    const checkCommonElements = async (doc) => {
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('How do you want to pay?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'card-payment-label',
        'card-payment-label-hint',
        'bacs-payment-label',
        'bacs-payment-label-abbr',
        'bacs-payment-label-hint'
      ])
    }

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('value is formated correctly including pence', async () => {
        fakeApplicationLine.value = 10000.25
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)

        Code.expect(doc.getElementById('payment-cost').firstChild.nodeValue).to.equal('10,000.25')
      })

      lab.test('value is formated without pence', async () => {
        fakeApplicationLine.value = 1000
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)

        Code.expect(doc.getElementById('payment-cost').firstChild.nodeValue).to.equal('1,000')
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

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'payment-type': PaymentTypes.BACS_PAYMENT
        }
      }
    })

    lab.experiment('success', () => {
      lab.test('when payment is selected as bacs', async () => {
        postRequest.payload = { 'payment-type': PaymentTypes.BACS_PAYMENT }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/pay/bacs')
      })

      lab.test('when payment is selected as card', async () => {
        postRequest.payload = { 'payment-type': PaymentTypes.CARD_PAYMENT }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.startWith('/pay/card')
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when payment is not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        GeneralTestHelper.checkValidationMessage(doc, 'payment-type', 'Select how you want to pay')
      })
    })
  })
})
