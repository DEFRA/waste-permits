'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const RecoveryService = require('../../src/services/recovery.service')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const AirQualityManagementArea = require('../../src/models/airQualityManagementArea.model')
const AirQualityManagementAreaTask = require('../../src/models/taskList/airQualityManagementArea.task')

const routePath = '/mcp/aqma/name'
const nextRoutePath = '/task-list'

let sandbox
let mocks

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Is any plant or generator in an Air Quality Management Area?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'aqma-check-list',
    'aqma-on',
    'aqma-on-label',
    'aqma-name',
    'aqma-name-label',
    'aqma-nitrogen-dioxide-level',
    'aqma-nitrogen-dioxide-level-label',
    'aqma-nitrogen-dioxide-level-hint',
    'aqma-local-authority-name',
    'aqma-local-authority-name-label',
    'aqma-off',
    'aqma-off-label'
  ])
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(AirQualityManagementArea, 'get').callsFake(async () => mocks.airQualityManagementArea)
  sandbox.stub(AirQualityManagementArea.prototype, 'save').callsFake(async () => undefined)
  sandbox.stub(AirQualityManagementAreaTask, 'updateCompleteness').callsFake(async () => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Air Quality Management Area page tests:', () => {
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
        await checkCommonElements(doc)
      })
      lab.test('when  data already entered and not in Aqma', async () => {
        mocks.airQualityManagementArea.isInAqma = false
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
      })
      lab.test('when all data already entered and in Aqma', async () => {
        mocks.airQualityManagementArea.isInAqma = true
        mocks.airQualityManagementArea.name = 'AQMA NAME'
        mocks.airQualityManagementArea.nitrogenDioxideLevel = 50
        mocks.airQualityManagementArea.localAuthorityName = 'AQMA LOCAL AUTHORITY NAME'
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
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
          'aqma-is-in-aqma': 'yes',
          'aqma-name': 'AQMA NAME',
          'aqma-nitrogen-dioxide-level': '50',
          'aqma-local-authority-name': 'AQMA LOCAL AUTHORITY NAME'
        }
      }
    })

    lab.experiment('success', async () => {
      lab.test('when Yes to AQMA and all fields completed', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test('when a nitrogen dioxide level of 0 is entered', async () => {
        postRequest.payload['aqma-nitrogen-dioxide-level'] = '0'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test('when a nitrogen dioxide level of 100 is entered', async () => {
        postRequest.payload['aqma-nitrogen-dioxide-level'] = '100'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test('when No to AQMA', async () => {
        postRequest.payload = { 'aqma-is-in-aqma': 'no' }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when neither Yes nor No selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-is-in-aqma', 'Please select Yes or No')
      })

      lab.test('when no string is entered for AQMA name', async () => {
        postRequest.payload['aqma-name'] = ''
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-name', 'Enter the AQMA name')
      })
      lab.test('when the AQMA name string is over 150 chars', async () => {
        postRequest.payload['aqma-name'] = 'TEST STRING '.repeat(13)
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-name', 'Enter the AQMA name with fewer than 150 characters')
      })

      lab.test('when no nitrogen dioxide level is entered', async () => {
        postRequest.payload['aqma-nitrogen-dioxide-level'] = ''
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-nitrogen-dioxide-level', 'Enter the background level of nitrogen dioxide')
      })
      lab.test('when a nitrogen dioxide level below 0 is entered', async () => {
        postRequest.payload['aqma-nitrogen-dioxide-level'] = '-1'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-nitrogen-dioxide-level', 'The background level should be a whole number between 0 and 100')
      })
      lab.test('when a nitrogen dioxide level above 100 is entered', async () => {
        postRequest.payload['aqma-nitrogen-dioxide-level'] = '101'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-nitrogen-dioxide-level', 'The background level should be a whole number between 0 and 100')
      })
      lab.test('when a decimal nitrogen dioxide level is entered', async () => {
        postRequest.payload['aqma-nitrogen-dioxide-level'] = '50.1'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-nitrogen-dioxide-level', 'The background level should be a whole number between 0 and 100')
      })
      lab.test('when an invalid string is entered for the nitrogen dioxide level', async () => {
        postRequest.payload['aqma-nitrogen-dioxide-level'] = 'INVALID STRING'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-nitrogen-dioxide-level', 'The background level should be a whole number between 0 and 100')
      })

      lab.test('when no string is entered for local authority name', async () => {
        postRequest.payload['aqma-local-authority-name'] = ''
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-local-authority-name', 'Enter the local authority name')
      })
      lab.test('when the local authority name string is over 150 chars', async () => {
        postRequest.payload['aqma-local-authority-name'] = 'TEST STRING '.repeat(13)
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'aqma-local-authority-name', 'Enter the local authority name with fewer than 150 characters')
      })
    })
  })
})
