'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'

const ActivityList = require('../../../src/models/triage/activityList.model')
const AssessmentList = require('../../../src/models/triage/assessmentList.model')

const BESPOKE = [{ id: 'bespoke', canApplyOnline: true }]
const LTD_CO = [{ id: 'limited-company', canApplyOnline: true }]
const WASTE = [{ id: 'waste', canApplyOnline: true }]
const ACTIVITIES = [{ id: 'activity-1', canApplyOnline: true }, { id: 'activity-2', canApplyOnline: true }]

const FAKE_ASSESSMENT_ID = 'fake-assessment'
const FAKE_ASSESSMENT_ID2 = `${FAKE_ASSESSMENT_ID}-2`
const FAKE_ASSESSMENT = { id: FAKE_ASSESSMENT_ID, text: 'Fake assessment text', canApplyOnline: true }
const FAKE_ASSESSMENT2 = { id: FAKE_ASSESSMENT_ID2, text: 'Fake assessment 2 text', canApplyOnline: false }

const routePath = '/select/bespoke/limited-company/waste/activity-1+activity-2'
const badPath = `${routePath}/invalid`
const nextRoutePath = `${routePath}/${FAKE_ASSESSMENT_ID}`

let getRequest
let postRequest

let fakeActivityList
let fakeAssessment
let fakeAssessmentList
let sandbox

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What plans do we need to assess?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
  Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'legend'
  ])
}

lab.beforeEach(() => {
  fakeActivityList = new ActivityList({}, BESPOKE, LTD_CO, WASTE, ACTIVITIES)

  fakeAssessment = Object.assign({}, FAKE_ASSESSMENT)
  fakeAssessmentList = new AssessmentList({}, BESPOKE, LTD_CO, WASTE, ACTIVITIES, [fakeAssessment])

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AuthService.prototype, 'getToken').value(() => DUMMY_AUTH_TOKEN)
  sandbox.stub(ActivityList, 'createList').value(() => fakeActivityList)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage assessment page tests:', () => {
  lab.experiment('GET:', () => {
    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
      fakeAssessment = Object.assign({}, FAKE_ASSESSMENT)
      const fakeAssessment2 = Object.assign({}, FAKE_ASSESSMENT2)
      fakeAssessmentList = new AssessmentList({}, BESPOKE, LTD_CO, WASTE, ACTIVITIES, [fakeAssessment, fakeAssessment2])
      sandbox.stub(AssessmentList, 'createList').value(() => fakeAssessmentList)
    })

    new GeneralTestHelper({ lab, routePath }).test({
      excludeCookieGetTests: true,
      excludeCookiePostTests: true,
      excludeAlreadySubmittedTest: true })

    lab.test('GET returns the assessment page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
    })

    lab.test('GET redirects to the assessment page when an invalid value is requested in the path', async () => {
      getRequest.url = badPath
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(routePath)
    })

    lab.test('GET for assessment that cannot be applied for online shows apply offline page', async () => {
      fakeAssessment.canApplyOnline = false
      sandbox.stub(AssessmentList, 'createList').value(() => fakeAssessmentList)
      getRequest.url = nextRoutePath
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
      Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
    })

    lab.test('GET for for multiple assessments where some cannot be applied for online shows apply offline page', async () => {
      fakeAssessmentList = new AssessmentList({}, BESPOKE, LTD_CO, WASTE, ACTIVITIES, [fakeAssessment, Object.assign({}, FAKE_ASSESSMENT2)])
      sandbox.stub(AssessmentList, 'createList').value(() => fakeAssessmentList)
      getRequest.url = `${nextRoutePath}+${FAKE_ASSESSMENT_ID2}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
      Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
    })

    lab.experiment('GET displays the correct assessments', () => {
      // Currently only testing one scenario - there might be others
      const expectedAssessments = [
        { id: FAKE_ASSESSMENT_ID, text: FAKE_ASSESSMENT.text },
        { id: FAKE_ASSESSMENT_ID2, text: FAKE_ASSESSMENT2.text }
      ]

      expectedAssessments.forEach(({ id, text }) => {
        lab.test(`should include option for ${text}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const prefix = `assessment-${id}`
          Code.expect(doc.getElementById(`${prefix}-input`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(id)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`).firstChild.nodeValue.trim()).to.equal(text)
        })
      })
    })
  })

  lab.experiment('POST:', () => {
    lab.beforeEach(() => {
      fakeAssessment = Object.assign({}, FAKE_ASSESSMENT)
      fakeAssessmentList = new AssessmentList({}, BESPOKE, LTD_CO, WASTE, ACTIVITIES, [fakeAssessment])
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: { 'assessment': FAKE_ASSESSMENT_ID }
      }
      sandbox.stub(AssessmentList, 'createList').value(() => fakeAssessmentList)
    })

    lab.test('POST activity redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })
  })
})
