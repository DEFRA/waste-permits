'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const MiningWasteDetails = require('../../src/models/taskList/miningWasteDetails.task')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/mining-waste/weight'
const nextRoutePath = '/task-list'

let sandbox
let mocks

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('How much extractive waste will you produce?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'mining-waste-weight-label',
    'mining-waste-weight'
  ])
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(MiningWasteDetails, 'isComplete').value(() => false)
  sandbox.stub(MiningWasteDetails, 'updateCompleteness').value(() => {})
  sandbox.stub(MiningWasteDetails, 'clearCompleteness').value(() => {})
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment.only('How much extractive waste will you produce? page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('when first time', async () => {
        const doc = await GeneralTestHelper.getDoc(request)
        checkCommonElements(doc)
      })
    })

    lab.experiment('failure', () => {
      lab.test('error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
        }

        const res = await server.inject(request)
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
          'mining-waste-weight': 'one,hundred-thousand'
        }
      }
    })

    lab.experiment('success', async () => {
      lab.test('when weight entered is valid', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when mining waste weight not entered', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'mining-waste-weight', 'Enter a weight')
      })

      lab.test('when mining waste is not a number', async () => {
        postRequest.payload = {
          'mining-waste-weight': 'The weight must be a number'
        }
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'mining-waste-weight', 'The weight must be a number')
      })
    })

    lab.experiment('failure', () => {
      lab.test('error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        sinon.stub(Application.prototype, 'save').value(() => {
          throw new Error('update failed')
        })

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })
})
