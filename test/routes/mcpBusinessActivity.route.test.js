'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CharityDetail = require('../../src/models/charityDetail.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const McpBusinessType = require('../../src/models/mcpBusinessType.model')

const routePath = '/mcp/business-activity'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

let sandbox
let mocks

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What is the main type of business or activity the plant is used for?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  // Test for the existence of expected entries
  GeneralTestHelper.checkElementsExist(doc, [
    'type-codes-option-main-1',
    'type-codes-option-main-1-label',
    'type-codes-option-other',
    'type-codes-option-other-label',
    'type-codes-option-other-select',
    'type-codes-option-other-select-label',
    'type-codes-other'
  ])
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').callsFake(async () => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(CharityDetail, 'get').value(() => undefined)
  sandbox.stub(McpBusinessType, 'getMcpBusinessTypesLists').callsFake(async () => mocks.mcpBusinessTypesLists)
  sandbox.stub(McpBusinessType, 'get').callsFake(async () => mocks.mcpBusinessType)
  sandbox.stub(McpBusinessType, 'save').callsFake(async () => null)
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
      })
      lab.test('when option already selected', async () => {
        mocks.mcpBusinessType.code = 'd-35'
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
      })
      lab.test('when other value already selected', async () => {
        mocks.mcpBusinessType.code = 'other-1'
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
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

    lab.experiment('success', async () => {
      lab.test('when option selected', async () => {
        postRequest.payload = { 'type-codes-option': 'main-1' }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when other selected', async () => {
        postRequest.payload = { 'type-codes-option': 'other', 'type-codes-other': 'other-1' }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when no option selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-option', `Select the business or activity`)
      })
      lab.test(`when 'other' option selected but no value chosen`, async () => {
        postRequest.payload['type-codes-option'] = 'other'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'type-codes-other', `Select the business or activity`)
      })
    })
  })
})
