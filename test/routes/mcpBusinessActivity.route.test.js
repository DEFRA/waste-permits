'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const McpBusinessType = require('../../src/models/mcpBusinessType.model')

const routePath = '/mcp/business-activity'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

let sandbox
let mocks

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What is the NACE code for the main business activity that the plant or generator is used for?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  // Test for the existence of expected entries
  GeneralTestHelper.checkElementsExist(doc, [
    'type-codes-option-00-01',
    'type-codes-option-00-01-label',
    'type-codes-option-other',
    'type-codes-option-other-label',
    'type-codes-option-other-enter',
    'type-codes-option-other-enter-label',
    'type-codes-other'
  ])
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(McpBusinessType, 'getMcpMainBusinessTypesList').callsFake(() => mocks.mcpMainBusinessTypesList)
  sandbox.stub(McpBusinessType, 'get').callsFake(async () => mocks.mcpBusinessType)
  sandbox.stub(McpBusinessType, 'save').callsFake(async () => null)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('MCP business or activity page tests:', () => {
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
      lab.test('when first time', async () => {
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('type-codes-option-00-01').hasAttribute('checked')).to.be.false()
        Code.expect(doc.getElementById('type-codes-option-other').hasAttribute('checked')).to.be.false()
        Code.expect(doc.getElementById('type-codes-other').getAttribute('value')).to.be.empty()
      })
      lab.test('when option already selected', async () => {
        mocks.mcpBusinessType.code = '00.01'
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('type-codes-option-00-01').hasAttribute('checked')).to.be.true()
        Code.expect(doc.getElementById('type-codes-option-other').hasAttribute('checked')).to.be.false()
        Code.expect(doc.getElementById('type-codes-other').getAttribute('value')).to.be.empty()
      })
      lab.test('when other value already entered', async () => {
        mocks.mcpBusinessType.code = '99.99'
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
        Code.expect(doc.getElementById('type-codes-option-00-01').hasAttribute('checked')).to.be.false()
        Code.expect(doc.getElementById('type-codes-option-other').hasAttribute('checked')).to.be.true()
        Code.expect(doc.getElementById('type-codes-other').getAttribute('value')).to.equal('99.99')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
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

    lab.experiment('success', async () => {
      lab.test('when option selected', async () => {
        postRequest.payload = { 'type-codes-option': '00.01' }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when other value entered', async () => {
        postRequest.payload = { 'type-codes-option': 'other', 'type-codes-other': '99.99' }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when no option selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-option', `Select the business or activity`)
      })
      lab.test(`when 'other' option selected but no value entered`, async () => {
        postRequest.payload['type-codes-option'] = 'other'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-other', `Enter a valid 4-digit code that includes the decimal dot`)
      })
      lab.test(`when incorrect format value entered 9999`, async () => {
        postRequest.payload = { 'type-codes-option': 'other', 'type-codes-other': '9999' }
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-other', `Enter a valid 4-digit code that includes the decimal dot`)
      })
      lab.test(`when non-numeric value entered 9a.99`, async () => {
        postRequest.payload = { 'type-codes-option': 'other', 'type-codes-other': '9a.99' }
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-other', `Enter a valid 4-digit code that includes the decimal dot`)
      })
      lab.test(`when too long value entered 999.99`, async () => {
        postRequest.payload = { 'type-codes-option': 'other', 'type-codes-other': '999.99' }
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-other', `Enter a valid 4-digit code that includes the decimal dot`)
      })
      lab.test(`when too long value entered 99.999`, async () => {
        postRequest.payload = { 'type-codes-option': 'other', 'type-codes-other': '99.999' }
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-other', `Enter a valid 4-digit code that includes the decimal dot`)
      })
    })
  })
})
