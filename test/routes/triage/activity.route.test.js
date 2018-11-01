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

const BESPOKE = [{ id: 'bespoke', canApplyOnline: true }]
const LTD_CO = [{ id: 'limited-company', canApplyOnline: true }]
const WASTE = [{ id: 'waste-operation', canApplyOnline: true }]
const FAKE_ACTIVITY_ID = 'fake-activity'
const FAKE_ACTIVITY_ID2 = `${FAKE_ACTIVITY_ID}-2`
const FAKE_ACTIVITY = { id: FAKE_ACTIVITY_ID, text: 'Fake activity text', activityCode: '1.fake.code', canApplyOnline: true }
const FAKE_ACTIVITY2 = { id: FAKE_ACTIVITY_ID2, text: 'Fake activity 2 text', canApplyOnline: false }

const routePath = '/triage/bespoke/limited-company/waste-operation'
const badPath = `${routePath}/invalid`
const nextRoutePath = `${routePath}/${FAKE_ACTIVITY_ID}`
const endRoutePath = `${nextRoutePath}/--`

let getRequest
let postRequest

let fakeActivity
let fakeActivityList
let sandbox

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Select all the activities you want the permit to cover')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
  Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'legend'
  ])
}

lab.beforeEach(() => {
  fakeActivity = Object.assign({}, FAKE_ACTIVITY)
  fakeActivityList = new ActivityList({}, BESPOKE, LTD_CO, WASTE, [fakeActivity])

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AuthService.prototype, 'getToken').value(() => DUMMY_AUTH_TOKEN)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage activity page tests:', () => {
  lab.experiment('GET:', () => {
    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
      fakeActivity = Object.assign({}, FAKE_ACTIVITY)
      const fakeActivity2 = Object.assign({}, FAKE_ACTIVITY2)
      fakeActivityList = new ActivityList({}, BESPOKE, LTD_CO, WASTE, [fakeActivity, fakeActivity2])
      sandbox.stub(ActivityList, 'createList').value(() => fakeActivityList)
    })

    new GeneralTestHelper({ lab, routePath }).test({
      excludeCookieGetTests: true,
      excludeCookiePostTests: true,
      excludeAlreadySubmittedTest: true })

    lab.test('GET returns the activity page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
    })

    lab.test('GET redirects to the activity page when an invalid value is requested in the path', async () => {
      getRequest.url = badPath
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(routePath)
    })

    lab.test('GET for activity that cannot be applied for online shows apply offline page', async () => {
      fakeActivity.canApplyOnline = false
      sandbox.stub(ActivityList, 'createList').value(() => fakeActivityList)
      getRequest.url = nextRoutePath
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
      Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
    })

    lab.test('GET for for multiple activities where some cannot be applied for online shows apply offline page', async () => {
      fakeActivityList = new ActivityList({}, BESPOKE, LTD_CO, WASTE, [fakeActivity, Object.assign({}, FAKE_ACTIVITY2)])
      sandbox.stub(ActivityList, 'createList').value(() => fakeActivityList)
      getRequest.url = `${nextRoutePath}+${FAKE_ACTIVITY_ID2}`
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')
      Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
    })

    lab.experiment('GET displays the correct activities', () => {
      // Currently only testing one scenario - there might be others
      const expectedActivities = [
        { id: FAKE_ACTIVITY_ID, text: FAKE_ACTIVITY.text, hint: true },
        { id: FAKE_ACTIVITY_ID2, text: FAKE_ACTIVITY2.text, hint: false }
      ]

      expectedActivities.forEach(({ id, text, hint }) => {
        lab.test(`should include option for ${text}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const prefix = `activity-${id}`
          Code.expect(doc.getElementById(`${prefix}-input`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(id)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-text`)).to.exist()
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
      fakeActivity = Object.assign({}, FAKE_ACTIVITY)
      fakeActivityList = new ActivityList({}, BESPOKE, LTD_CO, WASTE, [fakeActivity])
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: { 'activity': FAKE_ACTIVITY_ID }
      }
      sandbox.stub(ActivityList, 'createList').value(() => fakeActivityList)
    })

    lab.test('POST activity redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(endRoutePath)
    })

    lab.test('POST shows the error message summary panel when no activity has been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'activity', 'Select the activities you want')
    })
  })
})
