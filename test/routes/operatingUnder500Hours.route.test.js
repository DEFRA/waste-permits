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
const LoggingService = require('../../src/services/logging.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')

const OperatingUnder500Hours = require('../../src/models/operatingUnder500Hours.model')

const {
  STATIONARY_MCP,
  STATIONARY_SG,
  STATIONARY_MCP_AND_SG,
  MOBILE_SG,
  MOBILE_SG_AND_MCP
} = require('../../src/dynamics').MCP_TYPES

const routePath = '/mcp-check/under-500-hours'
const yesRoutePath = '/maintain-application-lines'
const noRoutePath = '/mcp-check/air-dispersion-modelling-report'
const errorPath = '/errors/technical-problem'

let sandbox
let mocks
let taskDeterminantsStub

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.taskDeterminants.mcpType = STATIONARY_MCP // Set the mock permit to one that this screen displays for

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(OperatingUnder500Hours, 'get').callsFake(async () => mocks.operatingUnder500Hours)
  sandbox.stub(OperatingUnder500Hours.prototype, 'save').callsFake(async () => undefined)

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

lab.experiment('Operating under 500 hours page tests:', () => {
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
      lab.test('Check the basics for valid mcp types', async () => {
        const mcpTestTypes = [
          STATIONARY_MCP,
          STATIONARY_MCP_AND_SG
        ]
        for (const mcpType of mcpTestTypes) {
          mocks.taskDeterminants.mcpType = mcpType // Set the mock mcp type so the screen will display
          const doc = await GeneralTestHelper.getDoc(getRequest)
          Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Will your MCP operate for less than 500 hours a year?')
          Code.expect(doc.getElementById('back-link')).to.exist()
          Code.expect(doc.getElementById('operating-under-500-hours-yes')).to.exist()
          Code.expect(doc.getElementById('operating-under-500-hours-yes-label')).to.exist()
          Code.expect(doc.getElementById('operating-under-500-hours-no')).to.exist()
          Code.expect(doc.getElementById('operating-under-500-hours-no-label')).to.exist()
        }
      })

      const mcpTypes = [
        MOBILE_SG,
        STATIONARY_SG,
        MOBILE_SG_AND_MCP
      ]

      mcpTypes.forEach((mcpType) => {
        const { id } = mcpType
        lab.test(`Check the page is not displayed for MCP type ${id}`, async () => {
          mocks.taskDeterminants.mcpType = mcpType // Set the mock mcp type so the screen does NOT display
          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(noRoutePath)
        })
      })
    })

    lab.experiment('Failure', () => {
      lab.test('Redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
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
          'operating-under-500-hours': 'yes'
        }
      }
    })

    lab.test('Success - yes', async () => {
      // Choose 'Yes' and click 'Continue'
      postRequest.payload['operating-under-500-hours'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(yesRoutePath)
      Code.expect(taskDeterminantsStub.callCount).to.equal(1)
      Code.expect(taskDeterminantsStub.args[0][0].airDispersionModellingRequired).to.equal(false)
      Code.expect(taskDeterminantsStub.args[0][0].energyEfficiencyReportRequired).to.equal(false)
      Code.expect(taskDeterminantsStub.args[0][0].bestAvailableTechniquesAssessment).to.equal(false)
      Code.expect(taskDeterminantsStub.args[0][0].habitatAssessmentRequired).to.equal(false)
      Code.expect(taskDeterminantsStub.args[0][0].screeningToolRequired).to.equal(false)
    })

    lab.test('Success - no', async () => {
      // Choose 'No' and click 'Continue'
      postRequest.payload['operating-under-500-hours'] = 'no'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(noRoutePath)
    })

    lab.test('Invalid input', async () => {
      // Choose nothing and click 'Continue' (hence an empty payload)
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'operating-under-500-hours', 'Select yes or no')
    })
  })
})
