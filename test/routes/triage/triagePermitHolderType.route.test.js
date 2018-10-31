'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'

const PermitHolderTypeList = require('../../../src/models/triage/permitHolderTypeList.model')

const BESPOKE = [{ id: 'bespoke', canApplyOnline: true }]
const FAKE_PERMIT_HOLDER_TYPE_ID = 'fake-permit-holder-type'
const FAKE_PERMIT_HOLDER_TYPE = { id: FAKE_PERMIT_HOLDER_TYPE_ID, canApplyOnline: true }

const routePath = '/triage/bespoke'
const nextRoutePath = `${routePath}/${FAKE_PERMIT_HOLDER_TYPE_ID}`
const offlinePath = '/bespoke-apply-offline'

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

    lab.experiment('GET displays the correct permit holder types', () => {
      const expectedPermitHolderTypes = [
        { id: 'limited-company', text: 'Limited company' },
        { id: 'individual', text: 'Individual' },
        { id: 'sole-trader', text: 'Sole trader' },
        { id: 'public-body', text: 'Local authority or public body' },
        { id: 'partnership', text: 'Partnership' },
        { id: 'registered-charity', text: 'Registered charity' },
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
      fakePermitHolderType = Object.assign({}, FAKE_PERMIT_HOLDER_TYPE)
      fakePermitHolderTypeList = new PermitHolderTypeList({}, BESPOKE, [fakePermitHolderType])
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: { 'permit-holder-type': FAKE_PERMIT_HOLDER_TYPE_ID }
      }
      sandbox.stub(PermitHolderTypeList, 'createList').value(() => fakePermitHolderTypeList)
    })

    lab.test('POST for permit holder type that can apply online redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.test('POST for permit holder type that cannot apply online redirects to offline route', async () => {
      fakePermitHolderType.canApplyOnline = false
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(offlinePath)
    })

    lab.test('POST shows the error message summary panel when no permit holder type has been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'permit-holder-type', 'Select who will be the permit holder')
    })
  })
})
