'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CharityDetail = require('../../src/models/charityDetail.model')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/mining-waste/plan'
const nextRoutePath = '/mining-waste/weight'
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeStandardRule
let sandbox

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Which mining waste plan will you use?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'mining-waste-paragraph',
    'mining-waste-link',
    'mining-waste-plan',
    'water-based',
    'water-based-label',
    'water-and-oil-based',
    'water-and-oil-based-label'
  ])
}

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakeStandardRule = {
    code: 'STANDARD_RULE_CODE',
    guidanceUrl: 'STANDARD_RULE_GUIDANCE_URL'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(CharityDetail, 'get').value(() => new CharityDetail({}))
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => new Application(fakeStandardRule))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Which mining waste plan will you use? page tests:', () => {
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
        checkCommonElements(doc)
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
        payload: {
          'mining-waste-plan': '910400000'
        }
      }
    })

    lab.experiment('success', async () => {
      lab.test('when water based selected', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when water and oil based selected', async () => {
        postRequest.payload['mining-waste-plan'] = '910400001'
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when mining waste plan not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'mining-waste-plan', 'Select the plan you will use')
      })
    })
  })
})
