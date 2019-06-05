'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const server = require('../../server')
const GeneralTestHelper = require('./generalTestHelper.test')

const Application = require('../../src/persistence/entities/application.entity')
const StandardRuleType = require('../../src/persistence/entities/standardRuleType.entity')

const CookieService = require('../../src/services/cookie.service')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')

const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

const routePath = '/start/start-or-open-saved'
const nextRoutePath = '/bespoke-or-standard-rules'
const checkEmailRoutePath = '/save-return/search-your-email'

const shortcutPathMCP = `${routePath}/mcp`
const shortcutPathMCPNext = '/permit/select'

const shortcutPathMCPBespoke = `${routePath}/mcp-bespoke`
const shortcutPathMCPBespokeNext = '/mcp-type'

const shortcutPathGenerators = `${routePath}/generators`
const shortcutPathGeneratorsNext = '/permit/select'

const permitTypeQuery = '?permit-type='
const bespokeQuery = `${permitTypeQuery}bespoke`
const bespokeQueryNext = '/facility-type'
const standardRulesQuery = `${permitTypeQuery}standard-rules`
const standardRulesQueryNext = '/permit/category'
const invalidValueQuery = `${permitTypeQuery}invalid-value`
const invalidParameterQuery = '?invalid-parameter=invalid-value'

let getRequest
let postRequest
let cookeServiceSet
let taskDeterminantsSave

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

lab.beforeEach(() => {
  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'generateCookie').value(() => fakeCookie)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  cookeServiceSet = sandbox.stub(CookieService, 'set')
  cookeServiceSet.callsFake(async () => true)
  taskDeterminantsSave = sandbox.stub(TaskDeterminants.prototype, 'save')
  taskDeterminantsSave.callsFake(async () => undefined)
  sandbox.stub(Application.prototype, 'save').value(async () => undefined)
  sandbox.stub(StandardRuleType, 'getCategories').value(() => [
    { categoryName: 'mcpd-mcp', id: 123 },
    { categoryName: 'mcpd-sg', id: 321 }
  ])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Start or Open Saved page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a standard rules environmental permit')
    Code.expect(doc.getElementById('privacy-link').getAttribute('href')).to.equal('/information/privacy')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
    Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'legend',
      'start-application',
      'start-application-label',
      'open-application',
      'open-application-label',
      'privacy-link-paragraph'
    ])
  }

  lab.experiment('General page tests:', () => {
    lab.test('The page should NOT have a back link', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('back-link')).to.not.exist()
    })
  })

  lab.experiment('GET:', () => {
    lab.test('GET returns the Start or Open Saved page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
    })

    lab.test('GET correctly includes the bespoke parameter for next action', async () => {
      getRequest.url = `${getRequest.url}${bespokeQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(`${routePath}${bespokeQuery}`)
    })

    lab.test('GET correctly includes the standard rules parameter for next action', async () => {
      getRequest.url = `${getRequest.url}${standardRulesQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(`${routePath}${standardRulesQuery}`)
    })

    lab.test('GET does not include an invalid parameter value for next action', async () => {
      getRequest.url = `${getRequest.url}${invalidValueQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)
    })

    lab.test('GET does not include an invalid parameter for next action', async () => {
      getRequest.url = `${getRequest.url}${invalidParameterQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)
    })
  })

  lab.experiment('POST:', () => {
    lab.test('POST on Start or Open Saved page for a new application redirects to the next route', async () => {
      postRequest.payload = {
        'started-application': 'new'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.test('POST on Start or Open Saved page to open an existing application redirects to the correct route', async () => {
      postRequest.payload = {
        'started-application': 'open'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(checkEmailRoutePath)
    })

    lab.test('POST Start or Open Saved page shows the error message summary panel when new or open has not been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'started-application', 'Select start new or open a saved application')
    })

    lab.test('POST Start or Open Saved page passes on bespoke parameter', async () => {
      postRequest.url = `${postRequest.url}${bespokeQuery}`
      postRequest.payload = {
        'started-application': 'new'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(bespokeQueryNext)
    })

    lab.test('POST Start or Open Saved page passes on standard rules parameter', async () => {
      postRequest.url = `${postRequest.url}${standardRulesQuery}`
      postRequest.payload = {
        'started-application': 'new'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(standardRulesQueryNext)
    })

    lab.test('POST Start or Open Saved does not pass on invalid parameter value', async () => {
      postRequest.url = `${postRequest.url}${invalidValueQuery}`
      postRequest.payload = {
        'started-application': 'new'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.test('POST Start or Open Saved does not pass on invalid parameter', async () => {
      postRequest.url = `${postRequest.url}${invalidParameterQuery}`
      postRequest.payload = {
        'started-application': 'new'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })
  })

  lab.experiment('POST with optional shortcuts:', () => {
    lab.test('POST on Start or Open Saved page (with optional permitCategory == mcp)', async () => {
      postRequest.payload = {
        'started-application': 'new'
      }
      postRequest.url = shortcutPathMCP
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(shortcutPathMCPNext)
      Code.expect(cookeServiceSet.calledOnce).to.be.true()
      Code.expect(taskDeterminantsSave.calledOnce).to.be.true()
    })
    lab.test('POST on Start or Open Saved page (with optional permitCategory == generators)', async () => {
      postRequest.payload = {
        'started-application': 'new'
      }
      postRequest.url = shortcutPathGenerators
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(shortcutPathGeneratorsNext)
      Code.expect(cookeServiceSet.calledOnce).to.be.true()
      Code.expect(taskDeterminantsSave.calledOnce).to.be.true()
    })
    lab.test('POST on Start or Open Saved page (with optional permitCategory == mcp-bespoke)', async () => {
      postRequest.payload = {
        'started-application': 'new'
      }
      postRequest.url = shortcutPathMCPBespoke
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(shortcutPathMCPBespokeNext)
      Code.expect(cookeServiceSet.calledOnce).to.be.false()
      Code.expect(taskDeterminantsSave.calledOnce).to.be.true()
    })
  })
})
