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
const ApplicationEntity = require('../../../src/persistence/entities/application.entity')

const ActivityList = require('../../../src/models/triage/activityList.model')
const AssessmentList = require('../../../src/models/triage/assessmentList.model')
const Application = require('../../../src/models/triage/application.model')

const BESPOKE = [{ id: 'bespoke', canApplyOnline: true }]
const LTD_CO = [{ id: 'limited-company', canApplyOnline: true }]
const WASTE = [{ id: 'waste', canApplyOnline: true }]
const ACTIVITIES = [{ id: 'activity-1', text: 'Activity 1', canApplyOnline: true }, { id: 'activity-2', text: 'Activity 2', canApplyOnline: true }]
const ASSESSMENTS = [{ id: 'assessment-1', text: 'Assessment 1', canApplyOnline: true }, { id: 'assessment-2', text: 'Assessment 2', canApplyOnline: true }]

const routePath = '/select/bespoke/limited-company/waste/activity-1+activity-2/assessment-1+assessment-2'
const badPath = `${routePath}/invalid`
const nextRoutePath = `${routePath}/confirmed`

let getRequest
let postRequest

let fakeActivityList
let fakeAssessmentList
let sandbox

lab.beforeEach(() => {
  fakeActivityList = new ActivityList({}, BESPOKE, LTD_CO, WASTE, ACTIVITIES)
  fakeAssessmentList = new AssessmentList({}, BESPOKE, LTD_CO, WASTE, ACTIVITIES, ASSESSMENTS)

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AuthService.prototype, 'getToken').value(() => DUMMY_AUTH_TOKEN)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(ActivityList, 'createList').value(() => fakeActivityList)
  sandbox.stub(AssessmentList, 'createList').value(() => fakeAssessmentList)
  sandbox.stub(Application, 'getApplicationForId').value(() => new Application())
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage confirm and save page tests:', () => {
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

    lab.test('GET returns the confirm page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Confirm')
      Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)
    })

    lab.test('GET redirects to the confirm page when an invalid value is requested in the path', async () => {
      getRequest.url = badPath
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(routePath)
    })

    lab.experiment('GET displays the correct information', () => {
      ACTIVITIES.forEach(({ id, text }) => {
        lab.test(`should include text for activity ${text}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const prefix = `selected-activity-${id}`
          Code.expect(doc.getElementById(`${prefix}-text`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`).firstChild.nodeValue.trim()).to.equal(text)
        })
      })
      ASSESSMENTS.forEach(({ id, text }) => {
        lab.test(`should include text for assessment ${text}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const prefix = `selected-assessment-${id}`
          Code.expect(doc.getElementById(`${prefix}-text`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`).firstChild.nodeValue.trim()).to.equal(text)
        })
      })
    })

    lab.test('GET returns the confirmed page (after save) correctly', async () => {
      getRequest.url = nextRoutePath
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
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
        payload: {}
      }
      sandbox.stub(ApplicationEntity, 'getById').value(() => new ApplicationEntity({ id: 'APPLICATION_ID' }))
      sandbox.stub(ApplicationEntity.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(ApplicationEntity.prototype, 'save').value(() => {})

      applicationGetStub = sandbox.stub(Application, 'getApplicationForId')
      applicationGetStub.callsFake(async () => new Application({}))
      applicationSaveStub = sandbox.stub(Application.prototype, 'save')
      applicationSaveStub.callsFake(async () => null)
    })

    lab.test('POST confirmation redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.test('POST confirmation saves the application', async () => {
      await server.inject(postRequest)
      Code.expect(applicationGetStub.calledOnce).to.be.true()
      Code.expect(applicationSaveStub.calledOnce).to.be.true()
    })
  })
})
