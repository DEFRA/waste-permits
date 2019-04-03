'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')
const CookieService = require('../../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'

const TriageList = require('../../../src/models/triage/triageList.model')

let sandbox

const FAKE_PERMIT_TYPE_ID = 'fake-permit-type'
const FAKE_PERMIT_TYPE = { id: FAKE_PERMIT_TYPE_ID, canApplyOnline: false }

const routePath = '/select'
const badPath = `${routePath}/invalid`
const standardRuleRoutePath = '/permit-holder/type'
const bespokeRoutePath = `${routePath}/bespoke`
const offlinePath = `${routePath}/${FAKE_PERMIT_TYPE_ID}`

const permitTypeQuery = '?permit-type='
const bespokeQuery = `${permitTypeQuery}bespoke`
const standardRulesQuery = `${permitTypeQuery}standard-rules`
const invalidValueQuery = `${permitTypeQuery}invalid-value`
const invalidParameterQuery = '?invalid-parameter=invalid-value'

let getRequest
let postRequest

let fakePermitType
let fakePermitTypeList

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Confirm the type of permit you want')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
  Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'legend',
    'standard-rules-permit-type',
    'standard-rules-permit-type-label',
    'bespoke-permit-type',
    'bespoke-permit-type-label'
  ])
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AuthService.prototype, 'getToken').value(() => DUMMY_AUTH_TOKEN)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage permit type (bespoke or standard rules) page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true })

  lab.experiment('GET:', () => {
    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('GET returns the Bespoke or Standard Rules page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
      Code.expect(doc.getElementById('bespoke-permit-type').getAttribute('checked')).to.be.empty()
      Code.expect(doc.getElementById('standard-rules-permit-type').getAttribute('checked')).to.be.empty()
    })

    lab.test('GET redirects to the Bespoke or Standard Rules page when an invalid value is requested in the path', async () => {
      getRequest.url = badPath
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(routePath)
    })

    lab.test('GET for permit type that cannot be applied for online shows apply offline page', async () => {
      fakePermitType = Object.assign({}, FAKE_PERMIT_TYPE)
      fakePermitTypeList = new TriageList([fakePermitType])
      sandbox.stub(TriageList, 'createPermitTypesList').value(() => fakePermitTypeList)
      getRequest.url = offlinePath
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
      Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
    })

    lab.test('GET pre-selects bespoke when parameter provided', async () => {
      getRequest.url = `${getRequest.url}${bespokeQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('bespoke-permit-type').getAttribute('checked')).to.not.be.empty()
      Code.expect(doc.getElementById('standard-rules-permit-type').getAttribute('checked')).to.be.empty()
    })

    lab.test('GET pre-selects standard rules when parameter provided', async () => {
      getRequest.url = `${getRequest.url}${standardRulesQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('bespoke-permit-type').getAttribute('checked')).to.be.empty()
      Code.expect(doc.getElementById('standard-rules-permit-type').getAttribute('checked')).to.not.be.empty()
    })

    lab.test('GET does not pre-select when an invalid parameter value is provided', async () => {
      getRequest.url = `${getRequest.url}${invalidValueQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('bespoke-permit-type').getAttribute('checked')).to.be.empty()
      Code.expect(doc.getElementById('standard-rules-permit-type').getAttribute('checked')).to.be.empty()
    })

    lab.test('GET does not pre-select when an invalid parameter is provided', async () => {
      getRequest.url = `${getRequest.url}${invalidParameterQuery}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('bespoke-permit-type').getAttribute('checked')).to.be.empty()
      Code.expect(doc.getElementById('standard-rules-permit-type').getAttribute('checked')).to.be.empty()
    })
  })

  lab.experiment('POST:', () => {
    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {}
      }
    })

    lab.test('POST on Bespoke or Standard Rules page for a standard rule redirects to the next route', async () => {
      postRequest.payload = {
        'permit-type': 'standard-rules'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(standardRuleRoutePath)
    })

    lab.test('POST on Bespoke or Standard Rules page for bespoke redirects to the correct route', async () => {
      postRequest.payload = {
        'permit-type': 'bespoke'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(bespokeRoutePath)
    })

    lab.test('POST Bespoke or Standard Rules page shows the error message summary panel when bespoke or standard rules has not been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'permit-type', 'Select the type of permit you want')
    })
  })
})
