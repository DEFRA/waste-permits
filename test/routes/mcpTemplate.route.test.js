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
const McpTemplate = require('../../src/models/taskList/mcpTemplate.task')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/mcp/template/download'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(McpTemplate, 'isComplete').value(() => false)
  sandbox.stub(McpTemplate, 'updateCompleteness').value(() => {})
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('MCP template download page tests:', () => {
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
      lab.test('when not completed', async () => {
        const doc = await GeneralTestHelper.getDoc(request)
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Download and complete the plant or generator list template')
        Code.expect(doc.getElementById('mcp-template-downloaded')).to.not.exist()
        Code.expect(doc.getElementById('mcp-template-downloaded-button')).to.exist()
        Code.expect(doc.getElementById('return-to-task-list-button')).to.not.exist()
      })

      lab.test('when completed', async () => {
        McpTemplate.isComplete = () => true
        const doc = await GeneralTestHelper.getDoc(request)
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Download and complete the plant or generator list template')
        Code.expect(doc.getElementById('mcp-template-downloaded')).to.exist()
        Code.expect(doc.getElementById('mcp-template-downloaded-button')).to.not.exist()
        Code.expect(doc.getElementById('return-to-task-list-button')).to.exist()
      })

      lab.test('download links are correct', async () => {
        McpTemplate.isComplete = () => true
        const doc = await GeneralTestHelper.getDoc(request)
        Code.expect(doc.getElementById('mcp-template-xls-link').getAttribute('download')).to.equal('mcp-plant-generator-list-template-v0-1.xls')
        Code.expect(doc.getElementById('mcp-template-ods-link').getAttribute('download')).to.equal('mcp-plant-generator-list-template-v0-1.ods')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when isComplete fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        McpTemplate.isComplete = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(request)
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
        payload: {}
      }
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when updateCompletenesss fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        McpTemplate.updateCompleteness = () => {
          throw new Error('update failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
