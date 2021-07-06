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
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const { COOKIE_RESULT } = require('../../src/constants')
const { STATIONARY_MCP, STATIONARY_MCP_AND_SG, MOBILE_MCP } = require('../../src/dynamics').MCP_TYPES
const routePath = '/mcp-check/energy-report'

const nextRoutePath = '/mcp-check/best-available-techniques/sg'
const stationaryMcpRoutePath = '/mcp-check/best-available-techniques/mcp'
const maintainApplicationLinesRoutePath = '/maintain-application-lines'

let sandbox
let mocks
let taskDeterminantsStub

lab.beforeEach(() => {
  mocks = new Mocks()
  mocks.taskDeterminants.mcpType = STATIONARY_MCP_AND_SG // Set the mock permit to one that this screen displays for

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
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Do you need to provide an energy efficiency report?')
        Code.expect(doc.getElementById('back-link')).to.exist()
        Code.expect(doc.getElementById('energy-report-required-message')).to.exist()
        Code.expect(doc.getElementById('energy-report-required-help')).to.exist()
        Code.expect(doc.getElementById('new-or-refurbished-yes')).to.exist()
        Code.expect(doc.getElementById('new-or-refurbished-no')).to.exist()
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    const checkTaskDeterminants = ({ energyEfficiencyReportRequired }) => {
      Code.expect(taskDeterminantsStub.callCount).to.equal(1)
      const determinants = taskDeterminantsStub.args[0][0]
      Code.expect(determinants.energyEfficiencyReportRequired).to.equal(energyEfficiencyReportRequired)
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

    lab.experiment('success', () => {
      lab.test(`Redirects correctly to ${nextRoutePath} when ${STATIONARY_MCP_AND_SG.id}`, async () => {
        mocks.taskDeterminants.mcpType = STATIONARY_MCP_AND_SG
        // Make selections and click 'Continue'
        postRequest.payload['new-or-refurbished'] = 'yes'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test(`Redirects correctly to ${stationaryMcpRoutePath} when ${STATIONARY_MCP.id}`, async () => {
        mocks.taskDeterminants.mcpType = STATIONARY_MCP
        // Make selections and click 'Continue'
        postRequest.payload['new-or-refurbished'] = 'yes'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(stationaryMcpRoutePath)
      })

      lab.test(`Redirects correctly to ${maintainApplicationLinesRoutePath} when ${MOBILE_MCP.id}`, async () => {
        mocks.taskDeterminants.mcpType = MOBILE_MCP
        // Make selections and click 'Continue'
        postRequest.payload['new-or-refurbished'] = 'yes'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(maintainApplicationLinesRoutePath)
      })

      lab.test('New or refurbished, thermal input over 20MW, boiler', async () => {
        postRequest.payload['new-or-refurbished'] = 'yes'
        await server.inject(postRequest)
        checkTaskDeterminants({ energyEfficiencyReportRequired: true })
      })

      lab.test('Not New or refurbished, thermal input over 20MW, boiler', async () => {
        postRequest.payload['new-or-refurbished'] = 'no'
        await server.inject(postRequest)
        checkTaskDeterminants({ energyEfficiencyReportRequired: false })
      })
    })
    lab.experiment('Invalid input', () => {
      lab.test('Missing new or refurbished', async () => {
        postRequest.payload['total-aggregated-thermal-input'] = 'under 20'
        postRequest.payload['engine-type'] = 'boiler etc'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'new-or-refurbished', 'Select yes or no')
      })

      lab.test('Missing everything', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'new-or-refurbished', 'Select yes or no')
      })
    })
  })
})
