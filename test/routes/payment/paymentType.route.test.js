'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationCost = require('../../../src/models/applicationCost.model')
const TaskList = require('../../../src/models/taskList/base.taskList')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const PaymentTypes = {
  CARD_PAYMENT: 910400000,
  BACS_PAYMENT: 910400005
}

let sandbox
let mocks

const fakeSlug = 'SLUG'

const routePath = `/pay/type`

lab.beforeEach(() => {
  mocks = new Mocks()

  mocks.context.slug = fakeSlug

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationCost, 'getApplicationCostForApplicationId').callsFake(async () => mocks.applicationCostModel)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(async () => mocks.recovery)
  sandbox.stub(TaskList, 'getTaskListClass').value(async () => TaskList)
  sandbox.stub(TaskList, 'isComplete').value(async () => true)
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
      lab.test('value is formatted correctly including pence', async () => {
        // TODO: mock this in a tidier way
        mocks.applicationCostModel.totalCostItem.cost = 10000.25
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)

        Code.expect(doc.getElementById('payment-cost').firstChild.nodeValue).to.equal('10,000.25')
      })

      lab.test('value is formatted without pence', async () => {
        // TODO: mock this in a tidier way
        mocks.applicationCostModel.totalCostItem.cost = 1000
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
        Code.expect(res.statusCode).to.equal(500)
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
