'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const RecoveryService = require('../../src/services/recovery.service')

const TaskDeterminants = require('../../src/models/taskDeterminants.model')

const Application = require('../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const StandardRuleType = require('../../src/persistence/entities/standardRuleType.entity')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/permit/select'
const nextRoutePath = '/task-list'
const offlineRoutePath = '/start/apply-offline'
const existingPermitRoutePath = '/existing-permit'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(TaskDeterminants.prototype, 'save').value(() => undefined)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationLine, 'getById').value(() => undefined)
  sandbox.stub(ApplicationLine.prototype, 'save').value(() => undefined)
  sandbox.stub(ApplicationLine.prototype, 'delete').value(() => undefined)
  sandbox.stub(StandardRule, 'list').value(() => [mocks.standardRule])
  sandbox.stub(StandardRule, 'getByCryptoId').value(() => mocks.standardRule)
  sandbox.stub(StandardRuleType, 'getById').value(() => mocks.standardRuleType)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Select a permit page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Select a permit')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
    Code.expect(doc.getElementById('select-permit-hint-text')).to.exist()
    Code.expect(doc.getElementById('permit-type-description').firstChild.nodeValue).to.equal(mocks.standardRuleType.category.toLowerCase())
  }

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      let permits

      const newPermit = (options) => new StandardRule(Object.assign({}, mocks.standardRule, options))

      lab.beforeEach(() => {
        permits = [
          newPermit({
            id: 'permit-0',
            permitName: 'Permit one',
            selectionDisplayName: 'Select permit one',
            limits: '',
            code: 'permit code 0'
          }),
          newPermit({
            id: 'permit-1',
            permitName: 'Permit two',
            selectionDisplayName: 'Select permit two',
            limits: 'limit two',
            code: 'permit code 1'
          }),
          newPermit({
            id: 'permit-2',
            permitName: 'Permit three',
            selectionDisplayName: 'Select permit three',
            limits: '',
            code: 'permit code 2'
          }),
          newPermit({
            id: 'permit-3',
            permitName: 'Permit four',
            selectionDisplayName: 'Select permit four',
            limits: '',
            code: 'permit code 3'
          })
        ]
        StandardRule.list = () => permits
      })

      lab.test('should include permits ', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)

        permits.forEach(({ id, permitName, selectionDisplayName, code, limits, codeForId, cryptoId }) => {
          const prefix = `chosen-permit-${codeForId}`
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(cryptoId)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-name`).firstChild.nodeValue.trim()).to.equal(selectionDisplayName)
          Code.expect(doc.getElementById(`${prefix}-code`).firstChild.nodeValue.trim()).to.equal(code)
          if (limits) {
            Code.expect(doc.getElementById(`${prefix}-weight`).firstChild.nodeValue.trim()).to.equal(limits)
          } else {
            Code.expect(doc.getElementById(`${prefix}-weight`)).to.not.exist()
          }
        })
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })

      lab.test('redirects to error screen when failing to get the permits', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        StandardRule.list = () => {
          throw new Error('search failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })

      lab.test('redirects to error screen when failing to get the category', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        StandardRuleType.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
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
        payload: {}
      }
    })

    lab.experiment('success', () => {
      lab.test(`redirects to "${nextRoutePath}" when permit selected is an online permit`, async () => {
        postRequest.payload['chosen-permit'] = mocks.standardRule.cryptoId
        const res = await server.inject(postRequest)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`redirects to "${offlineRoutePath}" when permit selected is an offline permit`, async () => {
        mocks.standardRule.canApplyOnline = false
        postRequest.payload['chosen-permit'] = mocks.standardRule.cryptoId
        const res = await server.inject(postRequest)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(offlineRoutePath)
      })

      lab.test(`redirects to "${existingPermitRoutePath}" when permit selected is an MCP permit`, async () => {
        mocks.standardRuleType.category = 'MCPD category'
        mocks.standardRuleType.hint = 'category_HINT'
        mocks.standardRuleType.categoryName = 'mcpd-mcp'
        postRequest.payload['chosen-permit'] = mocks.standardRule.cryptoId
        const res = await server.inject(postRequest)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(existingPermitRoutePath)
      })
    })

    lab.test('invalid when permit not selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'chosen-permit', 'Select the permit you want')
    })
  })
})
