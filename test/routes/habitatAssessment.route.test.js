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
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const { MOBILE_SG } = require('../../src/dynamics').MCP_TYPES

const routePath = '/mcp-check/habitat-assessment'
const nextRoutePath = '/maintain-application-lines'

let sandbox
let mocks
let taskDeterminantsStub

lab.beforeEach(() => {
  mocks = new Mocks()

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

lab.experiment('Habitat assessment page tests:', () => {
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
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Do you need a habitat assessment?')
        Code.expect(doc.getElementById('back-link')).to.exist()
        Code.expect(doc.getElementById('habitat-assessment-yes')).to.exist()
        Code.expect(doc.getElementById('habitat-assessment-yes-label')).to.exist()
        Code.expect(doc.getElementById('habitat-assessment-no')).to.exist()
        Code.expect(doc.getElementById('habitat-assessment-no-label')).to.exist()
      })

      lab.test('Check the url link is correct', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById('habitat-assessment-guidance-link').getAttribute('href')).to.equal('https://www.gov.uk/government/publications/environmental-permit-pre-application-advice-form')
      })

      lab.test('Check the page is not displayed for certain mcp types', async () => {
        mocks.taskDeterminants.mcpType = MOBILE_SG // Set the mock mcp type so the screen does NOT display
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
        Code.expect(taskDeterminantsStub.callCount).to.equal(1)
        Code.expect(taskDeterminantsStub.args[0][0].habitatAssessmentRequired).to.equal(false)
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
      postRequest.payload['habitat-assessment'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
      Code.expect(taskDeterminantsStub.callCount).to.equal(1)
      Code.expect(taskDeterminantsStub.args[0][0].habitatAssessmentRequired).to.equal(true)
    })

    lab.test('Success - no', async () => {
      // Choose 'No' and click 'Continue'
      postRequest.payload['habitat-assessment'] = 'no'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
      Code.expect(taskDeterminantsStub.callCount).to.equal(1)
      Code.expect(taskDeterminantsStub.args[0][0].habitatAssessmentRequired).to.equal(false)
    })

    lab.test('Invalid input', async () => {
      // Choose nothing and click 'Continue'
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'habitat-assessment', 'Select yes or no')
    })
  })
})
