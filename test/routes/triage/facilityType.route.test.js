'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'
const CookieService = require('../../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const TriageList = require('../../../src/models/triage/triageList.model')
const Application = require('../../../src/models/triage/application.model')

const FAKE_FACILITY_TYPE_ID = 'fake-facility-type'
const FAKE_FACILITY_TYPE = { id: FAKE_FACILITY_TYPE_ID, canApplyOnline: true }

const routePath = '/select/bespoke/limited-company'
const badPath = `${routePath}/invalid`
const nextRoutePath = `${routePath}/${FAKE_FACILITY_TYPE_ID}`
const endRoutePath = `/selected/confirm`

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
  fakeFacilityType = Object.assign({}, FAKE_FACILITY_TYPE)
  fakeFacilityTypeList = new TriageList([fakeFacilityType])

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AuthService.prototype, 'getToken').value(() => DUMMY_AUTH_TOKEN)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
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

    lab.test('GET redirects to the facility type page when an invalid value is requested in the path', async () => {
      getRequest.url = badPath
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(routePath)
    })

    lab.test('GET for facility types that cannot be applied for online shows apply offline page', async () => {
      fakeFacilityType.canApplyOnline = false
      sandbox.stub(TriageList, 'createFacilityTypesList').value(() => fakeFacilityTypeList)
      sandbox.stub(TriageList, 'createWasteActivitiesList').value(() => new TriageList([]))
      getRequest.url = nextRoutePath
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit for an installation, landfill, mine or water discharge')
      Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
    })

    lab.experiment('GET displays the correct facility types', () => {
      const expectedFacilityTypes = [
        { id: 'installation', text: 'Installation', hint: true },
        { id: 'waste', text: 'Waste operation', hint: true },
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
    let applicationGetStub
    let applicationSaveStub
    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: { 'facility-type': FAKE_FACILITY_TYPE_ID }
      }
      sandbox.stub(TriageList, 'createFacilityTypesList').value(() => fakeFacilityTypeList)
      sandbox.stub(TriageList, 'createWasteActivitiesList').value(() => new TriageList([]))
      sandbox.stub(TriageList, 'createIncludedWasteAssessmentsList').value(() => new TriageList([]))
      applicationGetStub = sandbox.stub(Application, 'getApplicationForId')
      applicationGetStub.callsFake(async () => new Application({}))
      applicationSaveStub = sandbox.stub(Application.prototype, 'save')
      applicationSaveStub.callsFake(async () => null)
    })

    lab.test('POST facility type redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(endRoutePath)
    })

    lab.test('POST shows the error message summary panel when no facility type has been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'facility-type', 'Select the type of facility you want')
    })

    lab.test('POST facility with no MCP types or waste activities saves the application', async () => {
      await server.inject(postRequest)
      Code.expect(applicationGetStub.calledOnce).to.be.true()
      Code.expect(applicationSaveStub.calledOnce).to.be.true()
    })
  })
})
