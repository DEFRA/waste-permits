'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'

const FacilityTypeList = require('../../../src/models/triage/facilityTypeList.model')

const BESPOKE = [{ id: 'bespoke', canApplyOnline: true }]
const LTD_CO = [{ id: 'limited-company', canApplyOnline: true }]
const FAKE_FACILITY_TYPE_ID = 'fake-facility-type'
const FAKE_FACILITY_TYPE = { id: FAKE_FACILITY_TYPE_ID, canApplyOnline: true }

const routePath = '/triage/bespoke/limited-company'
const nextRoutePath = `${routePath}/${FAKE_FACILITY_TYPE_ID}`
const offlinePath = '/bespoke-apply-offline'

let getRequest
let postRequest

let fakeFacilityType
let fakeFacilityTypeList
let sandbox

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What type of facility do you want the permit for?')
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

lab.experiment('Triage facility type page tests:', () => {
  lab.experiment('GET:', () => {
    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    new GeneralTestHelper({ lab, routePath }).test({
      excludeCookieGetTests: true,
      excludeCookiePostTests: true,
      excludeAlreadySubmittedTest: true })

    lab.test('GET returns the facility type page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
    })

    lab.experiment('GET displays the correct facility types', () => {
      const expectedFacilityTypes = [
        { id: 'installation', text: 'Installation', hint: true },
        { id: 'waste-operation', text: 'Waste operation', hint: true },
        { id: 'mining', text: 'Mining waste operation', hint: false },
        { id: 'discharge', text: 'Water discharge', hint: true },
        { id: 'groundwater', text: 'Groundwater activity', hint: false }
      ]

      expectedFacilityTypes.forEach(({ id, text, hint }) => {
        lab.test(`should include option for ${text}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const prefix = `facility-type-${id}`
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(id)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`).firstChild.nodeValue.trim()).to.equal(text)
          if (hint) {
            Code.expect(doc.getElementById(`${prefix}-hint`)).to.exist()
          }
        })
      })
    })
  })

  lab.experiment('POST:', () => {
    lab.beforeEach(() => {
      fakeFacilityType = Object.assign({}, FAKE_FACILITY_TYPE)
      fakeFacilityTypeList = new FacilityTypeList({}, BESPOKE, LTD_CO, [fakeFacilityType])
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: { 'facility-type': FAKE_FACILITY_TYPE_ID }
      }
      sandbox.stub(FacilityTypeList, 'createList').value(() => fakeFacilityTypeList)
    })

    lab.test('POST for facility type that can be applied for online redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.test('POST for facility type that cannot be applied for online redirects to offline route', async () => {
      fakeFacilityType.canApplyOnline = false
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(offlinePath)
    })

    lab.test('POST shows the error message summary panel when no facility type has been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'facility-type', 'Select the type of facility you want')
    })
  })
})
