'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const { STATIONARY_MCP, STATIONARY_SG, STATIONARY_MCP_AND_SG } = require('../../src/dynamics').MCP_TYPES

const routePath = '/mcp-check/air-dispersion-modelling-report'
const nextRoutePath = '/mcp-check/energy-report'
const thermalInput20To50MwRoutePath = '/mcp-check/best-available-techniques/sg'

let sandbox
let mocks
let taskDeterminantsStub

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.taskDeterminants.mcpType = STATIONARY_MCP_AND_SG.id // Set the mock mcp type so the screen displays

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(TaskDeterminants, 'get').value(() => mocks.taskDeterminants)
  taskDeterminantsStub = sandbox.stub(TaskDeterminants.prototype, 'save')
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

      lab.test('Check the links are correct when the type is a stationary mcp', async () => {
        mocks.taskDeterminants.mcpType = STATIONARY_MCP
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById('stationary-mcp-risk-assessment-tool-link').getAttribute('href')).to.equal('https://www.gov.uk/government/collections/risk-assessments-for-specific-activities-environmental-permits#H1-software-tool')
      })

      lab.test('Check the links are correct when the type is a stationary sg', async () => {
        mocks.taskDeterminants.mcpType = STATIONARY_SG
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById('stationary-sg-risk-assessment-tool-link').getAttribute('href')).to.equal('https://www.gov.uk/government/collections/risk-assessments-for-specific-activities-environmental-permits#H1-software-tool')
        Code.expect(doc.getElementById('specified-screening-tool-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/specified-generator-apply-for-an-environmental-permit#bespoke-permits')
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    const checkTaskDeterminants = ({ airDispersionModellingRequired, screeningToolRequired }) => {
      Code.expect(taskDeterminantsStub.callCount).to.equal(1)
      const determinants = taskDeterminantsStub.args[0][0]
      Code.expect(determinants.screeningToolRequired).to.equal(screeningToolRequired)
      Code.expect(determinants.airDispersionModellingRequired).to.equal(airDispersionModellingRequired)
      Code.expect(determinants.energyEfficiencyReportRequired).to.equal(false)
      Code.expect(determinants.bestAvailableTechniquesAssessment).to.equal(false)
      Code.expect(determinants.habitatAssessmentRequired).to.equal(false)
    }

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test(`Success - yes - when the type is a stationary mcp and sg - redirects to ${nextRoutePath}`, async () => {
      // Choose 'Yes' and click 'Continue'
      mocks.taskDeterminants.mcpType = STATIONARY_MCP_AND_SG
      postRequest.payload['air-dispersion-modelling'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRoutePath)
      checkTaskDeterminants({ airDispersionModellingRequired: true, screeningToolRequired: false })
    })

    lab.test(`Success - yes - when the type is a stationary mcp - redirects to ${nextRoutePath}`, async () => {
      // Choose 'Yes' and click 'Continue'
      mocks.taskDeterminants.mcpType = STATIONARY_MCP
      postRequest.payload['air-dispersion-modelling'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRoutePath)
      checkTaskDeterminants({ airDispersionModellingRequired: true, screeningToolRequired: false })
    })

    lab.test(`Success - yes - when the type is a stationary sg - redirects to ${thermalInput20To50MwRoutePath}`, async () => {
      // Choose 'Yes' and click 'Continue'
      mocks.taskDeterminants.mcpType = STATIONARY_SG
      postRequest.payload['air-dispersion-modelling'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(thermalInput20To50MwRoutePath)
      checkTaskDeterminants({ airDispersionModellingRequired: true, screeningToolRequired: false })
    })

    lab.test('Success - no', async () => {
      // Choose 'No' and click 'Continue'
      postRequest.payload['air-dispersion-modelling'] = 'no'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRoutePath)
      checkTaskDeterminants({ airDispersionModellingRequired: false, screeningToolRequired: true })
    })

    lab.test('Invalid input', async () => {
      // Choose nothing and click 'Continue' (hence an empty payload)
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'air-dispersion-modelling', 'Say if you need to include a dispersion modelling report')
    })
  })
})
