'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')
const { MCP_TYPES } = require('../../src/dynamics')
const { MOBILE_SG, MOBILE_SG_AND_MCP, STATIONARY_MCP, STATIONARY_MCP_AND_SG, STATIONARY_SG } = MCP_TYPES

const routePath = '/mcp-type'
const nextRoutePath = '/select/bespoke'
const existingPermitPath = '/existing-permit'
const maintainApplicationLinesPath = '/maintain-application-lines'
const requiresEnergyReportPath = '/mcp-check/energy-report'

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(TaskDeterminants.prototype, 'save').value(() => undefined)
  sandbox.stub(TaskDeterminants, 'get').value(() => mocks.taskDeterminants)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Mcp Type page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({ excludeAlreadySubmittedTest: true })

  lab.experiment(`GET ${routePath}`, () => {
    let request
    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('The page should have a back link', async () => {
      const doc = await GeneralTestHelper.getDoc(request)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What is your permit for?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      Object.values(MCP_TYPES).forEach((mcpType) => {
        lab.test(`redirects to ${nextRoutePath}/${mcpType.id} when ${mcpType.id} is selected`, async () => {
          request.payload['mcp-type'] = mcpType.id
          const res = await server.inject(request)
          Code.expect(res.statusCode).to.equal(302)
          switch (mcpType.id) {
            case STATIONARY_MCP.id:
            case STATIONARY_SG.id:
            case STATIONARY_MCP_AND_SG.id:
              Code.expect(res.headers['location']).to.equal(existingPermitPath)
              break
            case MOBILE_SG.id:
              Code.expect(res.headers['location']).to.equal(maintainApplicationLinesPath)
              break
            case MOBILE_SG_AND_MCP.id:
              Code.expect(res.headers['location']).to.equal(requiresEnergyReportPath)
              break
          }
        })
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when mcp type not selected', async () => {
        request.payload = {}
        const doc = await GeneralTestHelper.getDoc(request)
        await GeneralTestHelper.checkValidationMessage(doc, 'mcp-type', 'Select what your permit is for')
      })
    })
  })
})
