'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../server')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const Application = require('../../src/persistence/entities/application.entity')
const DataStore = require('../../src/models/dataStore.model')
const CharityDetail = require('../../src/models/charityDetail.model')
const CookieService = require('../../src/services/cookie.service')
const featureConfig = require('../../src/config/featureConfig')
const { COOKIE_RESULT } = require('../../src/constants')

let fakeApplication
let sandbox

const routePath = '/bespoke-or-standard-rules'
const nextRoutePath = '/permit-holder'
const bespokeRoutePath = '/select/bespoke'

const permitTypeQuery = '?permit-type='
const bespokeQuery = `${permitTypeQuery}bespoke`
const standardRulesQuery = `${permitTypeQuery}standard-rules`
const invalidValueQuery = `${permitTypeQuery}invalid-value`
const invalidParameterQuery = '?invalid-parameter=invalid-value'

let getRequest
let postRequest

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

let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

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

  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(DataStore, 'save').value(async () => mocks.dataStore.id)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(CharityDetail, 'get').value(() => new CharityDetail({}))
  // Todo: Remove hasBespokeFeature syub when bespoke is live
  sandbox.stub(featureConfig, 'hasBespokeFeature').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Bespoke or standard rules page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment('GET:', () => {
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
    lab.test('POST on Bespoke or Standard Rules page for a standard rule redirects to the next route', async () => {
      postRequest.payload = {
        'permit-type': 'standard-rules'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
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
