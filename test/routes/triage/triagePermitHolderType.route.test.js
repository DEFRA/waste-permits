'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'

const TriageList = require('../../../src/models/triage/triageList.model')

const FAKE_PERMIT_HOLDER_TYPE_ID = 'fake-permit-holder-type'
const FAKE_PERMIT_HOLDER_TYPE = { id: FAKE_PERMIT_HOLDER_TYPE_ID, canApplyOnline: true }

const routePath = '/select/bespoke'
const badPath = `${routePath}/invalid`
const nextRoutePath = `${routePath}/${FAKE_PERMIT_HOLDER_TYPE_ID}`

let getRequest
let postRequest

let fakePermitHolderType
let fakePermitHolderTypeList
let sandbox

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Who will be the permit holder?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
  Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'legend'
  ])
}

lab.beforeEach(() => {
  fakePermitHolderType = Object.assign({}, FAKE_PERMIT_HOLDER_TYPE)
  fakePermitHolderTypeList = new TriageList([fakePermitHolderType])

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AuthService.prototype, 'getToken').value(() => DUMMY_AUTH_TOKEN)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage permit holder type page tests:', () => {
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

    lab.test('GET returns the permit holder type page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
    })

    lab.test('GET redirects to the permit holder type page when an invalid value is requested in the path', async () => {
      getRequest.url = badPath
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(routePath)
    })

    lab.test('GET for permit holder types that cannot be applied for online shows apply offline page', async () => {
      fakePermitHolderType.canApplyOnline = false
      sandbox.stub(TriageList, 'createPermitHolderTypesList').value(() => fakePermitHolderTypeList)
      getRequest.url = nextRoutePath
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
      Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
    })

    lab.experiment('GET displays the correct permit holder types', () => {
      const expectedPermitHolderTypes = [
        { id: 'limited-company', text: 'Limited company' },
        { id: 'individual', text: 'Individual' },
        { id: 'sole-trader', text: 'Sole trader' },
        { id: 'public-body', text: 'Local authority or public body' },
        { id: 'partnership', text: 'Partnership' },
        { id: 'charity-or-trust', text: 'Registered charity' },
        { id: 'limited-liability-partnership', text: 'Limited liability partnership' },
        { id: 'other-organisation', text: 'Other organisation, for example a club or association' }
      ]

      expectedPermitHolderTypes.forEach(({ id, text }) => {
        lab.test(`should include option for ${text}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const prefix = `permit-holder-type-${id}`
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(id)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`).firstChild.nodeValue.trim()).to.equal(text)
        })
      })
    })
  })

  lab.experiment('POST:', () => {
    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: { 'permit-holder-type': FAKE_PERMIT_HOLDER_TYPE_ID }
      }
      sandbox.stub(TriageList, 'createPermitHolderTypesList').value(() => fakePermitHolderTypeList)
    })

    lab.test('POST permit holder type redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.test('POST shows the error message summary panel when no permit holder type has been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'permit-holder-type', 'Select who will be the permit holder')
    })
  })
})
