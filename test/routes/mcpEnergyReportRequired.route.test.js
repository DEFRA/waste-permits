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
const routePath = '/mcp-check/energy-report'

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

lab.experiment('Energy efficiency report page tests:', () => {
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
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('About your MCP or SG')
        Code.expect(doc.getElementById('back-link')).to.exist()
        Code.expect(doc.getElementById('energy-report-required-message')).to.exist()
        Code.expect(doc.getElementById('energy-report-required-help')).to.exist()
        Code.expect(doc.getElementById('new-or-refurbished-yes')).to.exist()
        Code.expect(doc.getElementById('new-or-refurbished-no')).to.exist()
        Code.expect(doc.getElementById('total-aggregated-thermal-input-under-20')).to.exist()
        Code.expect(doc.getElementById('total-aggregated-thermal-input-over-20')).to.exist()
        Code.expect(doc.getElementById('engine-type-boiler-etc')).to.exist()
        Code.expect(doc.getElementById('engine-type-spark-ignition')).to.exist()
      })

      lab.test('Check we don\'t display this page for certain permit types', async () => {
        mocks.dataStore.data.mcpType = 'mobile-sg' // Set the mock permit to one that this screen doesn't display for
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
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
        postRequest.payload['new-or-refurbished'] = 'yes'
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        postRequest.payload['engine-type'] = 'boiler etc'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('New or refurbished, thermal input over 20MW, boiler', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        postRequest.payload['total-aggregated-thermal-input'] = 'over 20'
        postRequest.payload['engine-type'] = 'boiler etc'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(true)
      })

      lab.test('New or refurbished, thermal input over 20MW, spark ignition', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        postRequest.payload['total-aggregated-thermal-input'] = 'over 20'
        postRequest.payload['engine-type'] = 'spark ignition'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(false)
      })

      lab.test('New or refurbished, thermal input under 20MW, boiler', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        postRequest.payload['engine-type'] = 'boiler etc'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(false)
      })

      lab.test('New or refurbished, thermal input under 20MW, spark ignition', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        postRequest.payload['engine-type'] = 'spark ignition'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(false)
      })

      lab.test('Not new or refurbished, thermal input over 20MW, boiler', async () => {
        postRequest.payload['new-or-refurbished'] = 'no'
        postRequest.payload['total-aggregated-thermal-input'] = 'over 20'
        postRequest.payload['engine-type'] = 'boiler etc'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(false)
      })

      lab.test('Not new or refurbished, thermal input over 20MW, spark ignition', async () => {
        postRequest.payload['new-or-refurbished'] = 'no'
        postRequest.payload['total-aggregated-thermal-input'] = 'over 20'
        postRequest.payload['engine-type'] = 'spark ignition'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(false)
      })

      lab.test('Not new or refurbished, thermal input under 20MW, boiler', async () => {
        postRequest.payload['new-or-refurbished'] = 'no'
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        postRequest.payload['engine-type'] = 'boiler etc'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(false)
      })

      lab.test('Not new or refurbished, thermal input under 20MW, spark ignition', async () => {
        postRequest.payload['new-or-refurbished'] = 'no'
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        postRequest.payload['engine-type'] = 'spark ignition'
        await server.inject(postRequest)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].energyEfficiencyReportRequired).to.equal(false)
      })
    })

    lab.experiment('Invalid input', async () => {
      lab.test('Missing new or refurbished', async () => {
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        postRequest.payload['engine-type'] = 'boiler etc'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'new-or-refurbished', 'Select yes or no')
      })

      lab.test('Missing thermal input', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        postRequest.payload['engine-type'] = 'boiler etc'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'total-aggregated-thermal-input', 'Select a thermal input')
      })

      lab.test('Missing engine type', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'engine-type', 'Select the type of engine it uses')
      })

      lab.test('Missing thermal input and engine type', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessageCount(doc, 2)
      })

      lab.test('Missing everything', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'new-or-refurbished', 'Select yes or no')
        await GeneralTestHelper.checkNoValidationMessage(doc, 'total-aggregated-thermal-input')
        await GeneralTestHelper.checkNoValidationMessage(doc, 'engine-type')
      })
    })
  })
})
