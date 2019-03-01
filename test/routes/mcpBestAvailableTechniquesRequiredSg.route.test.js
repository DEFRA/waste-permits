'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')
const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const DataStore = require('../../src/models/dataStore.model')
const { COOKIE_RESULT } = require('../../src/constants')
const routePath = '/mcp-check/best-available-techniques/sg'

// TODO: Set to the correct next route path (not task-list)
const nextRoutePath = '/task-list'
let sandbox
let mocks
let dataStoreStub

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.dataStore.data.mcpType = 'stationary-sg' // Set the mock permit to one that this screen displays for

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(DataStore, 'get').value(() => mocks.dataStore)
  dataStoreStub = sandbox.stub(DataStore, 'save')
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Best available techniques report required for SG tests:', () => {
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

    lab.experiment('Success', () => {
      lab.test('Check the basics', async () => {
        const doc = await GeneralTestHelper.getDoc(request)
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('About your generators')
        Code.expect(doc.getElementById('back-link')).to.exist()
        Code.expect(doc.getElementById('best-available-techniques-required-sg-message')).to.exist()
        Code.expect(doc.getElementById('thermal-rating-20-to-50')).to.exist()
        Code.expect(doc.getElementById('thermal-rating-not-20-to-50')).to.exist()
        Code.expect(doc.getElementById('engine-type-boiler-etc')).to.exist()
        Code.expect(doc.getElementById('engine-type-spark')).to.exist()
      })

      lab.test('Check we don\'t display this page for certain permit types', async () => {
        mocks.dataStore.data.mcpType = 'mobile-sg' // Set the mock permit to one that this screen doesn't display for
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].bestAvailableTechniquesAssessment).to.equal(false)
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
        payload: {}
      }
    })

    lab.experiment('Success', async () => {
      lab.test('Redirects correctly', async () => {
        // Make selections and click 'Continue'
        postRequest.payload['thermal-rating'] = '20 to 50'
        postRequest.payload['engine-type'] = 'boiler etc'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('Thermal rating 20MW to 50MW, boiler', async () => {
        postRequest.payload['thermal-rating'] = '20 to 50'
        postRequest.payload['engine-type'] = 'boiler etc'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].bestAvailableTechniquesAssessment).to.equal(true)
      })

      lab.test('Thermal rating 20MW to 50MW, spark ignition', async () => {
        postRequest.payload['thermal-rating'] = '20 to 50'
        postRequest.payload['engine-type'] = 'spark ignition'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].bestAvailableTechniquesAssessment).to.equal(false)
      })

      lab.test('Thermal rating not 20MW to 50MW, boiler', async () => {
        postRequest.payload['thermal-rating'] = 'not 20 to 50'
        postRequest.payload['engine-type'] = 'boiler etc'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].bestAvailableTechniquesAssessment).to.equal(false)
      })

      lab.test('Thermal rating not 20MW to 50MW, spark ignition', async () => {
        postRequest.payload['thermal-rating'] = 'not 20 to 50'
        postRequest.payload['engine-type'] = 'spark ignition'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].bestAvailableTechniquesAssessment).to.equal(false)
      })
    })

    lab.experiment('Invalid rating', async () => {
      lab.test('Missing thermal rating', async () => {
        postRequest.payload['engine-type'] = 'boiler etc'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'thermal-rating', 'Select yes or no')
      })

      lab.test('Missing engine type', async () => {
        postRequest.payload['thermal-rating'] = '20 to 50'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'engine-type', 'Select where it get its energy from')
      })

      lab.test('Missing everything', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'thermal-rating', 'Select yes or no')
        await GeneralTestHelper.checkNoValidationMessage(doc, 'engine-type')
      })
    })
  })
})
