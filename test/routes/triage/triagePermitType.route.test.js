'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'

const PermitTypeList = require('../../../src/models/triage/permitTypeList.model')

let sandbox

const FAKE_PERMIT_TYPE_ID = 'fake-permit-type'
const FAKE_PERMIT_TYPE = { id: FAKE_PERMIT_TYPE_ID, canApplyOnline: false }

const routePath = '/triage'
const standardRuleRoutePath = '/permit-holder'
const bespokeRoutePath = '/triage/bespoke'
const offlinePath = '/bespoke-apply-offline'

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

    lab.test('POST for permit type that cannot be applied for online redirects to offline route', async () => {
      fakePermitType = Object.assign({}, FAKE_PERMIT_TYPE)
      fakePermitTypeList = new PermitTypeList({}, [fakePermitType])
      sandbox.stub(PermitTypeList, 'getListOfAllPermitTypes').value(() => fakePermitTypeList)
      postRequest.payload = {
        'permit-type': FAKE_PERMIT_TYPE_ID
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(offlinePath)
    })

    lab.test('POST Bespoke or Standard Rules page shows the error message summary panel when bespoke or standard rules has not been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'permit-type', 'Select the type of permit you want')
    })
  })
})