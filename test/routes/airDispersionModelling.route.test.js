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
const { COOKIE_RESULT } = require('../../src/constants')
const DataStore = require('../../src/models/dataStore.model')
const { MCP_TYPES: { STATIONARY_MCP, STATIONARY_SG, MOBILE_SG } } = require('../../src/models/triage/triageLists')

const routePath = '/mcp-check/air-dispersion-modelling-report'
const nextRoutePath = '/mcp-check/energy-report'
const errorPath = '/errors/technical-problem'

let sandbox
let mocks
let dataStoreStub

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.dataStore.data.mcpType = STATIONARY_SG.id // Set the mock mcp type so the screen displays

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

lab.experiment('Dispersion modelling report page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('Success', () => {
      lab.test('Check the basics', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Do you need to provide an air dispersion modelling report?')
        Code.expect(doc.getElementById('back-link')).to.exist()
        Code.expect(doc.getElementById('air-dispersion-modelling-yes')).to.exist()
        Code.expect(doc.getElementById('air-dispersion-modelling-yes-label')).to.exist()
        Code.expect(doc.getElementById('air-dispersion-modelling-no')).to.exist()
        Code.expect(doc.getElementById('air-dispersion-modelling-no-label')).to.exist()
      })

      lab.test('Check the download links are correct', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById('air-emissions-risk-assessment-guidance-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/air-emissions-risk-assessment-for-your-environmental-permit')
        // TODO: Set the correct links
        Code.expect(doc.getElementById('specified-generator-screening-tool-download').getAttribute('download')).to.equal('')
      })

      lab.test('Check the page is not displayed for certain mcp types', async () => {
        mocks.dataStore.data.mcpType = MOBILE_SG.id // Set the mock mcp type so the screen does NOT display
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
        Code.expect(dataStoreStub.callCount).to.equal(1)
        Code.expect(dataStoreStub.args[0][1].airDispersionModellingRequired).to.equal(false)
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

    lab.test('Success - yes', async () => {
      // Choose 'Yes' and click 'Continue'
      postRequest.payload['air-dispersion-modelling'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
      Code.expect(dataStoreStub.callCount).to.equal(1)
      Code.expect(dataStoreStub.args[0][1].airDispersionModellingRequired).to.equal(true)
    })

    lab.test('Success - no', async () => {
      // Choose 'No' and click 'Continue'
      postRequest.payload['air-dispersion-modelling'] = 'no'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
      Code.expect(dataStoreStub.callCount).to.equal(1)
      Code.expect(dataStoreStub.args[0][1].airDispersionModellingRequired).to.equal(false)
    })

    lab.test('Invalid input', async () => {
      // Choose nothing and click 'Continue' (hence an empty payload)
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'air-dispersion-modelling', 'Say if you need to include a dispersion modelling report')
    })
  })
})
