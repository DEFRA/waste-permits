'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')
const Mocks = require('../../helpers/mocks')
const AuthService = require('../../../src/services/activeDirectoryAuth.service')
const DUMMY_AUTH_TOKEN = 'dummy-auth-token'
const CookieService = require('../../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const Application = require('../../../src/models/triage/application.model')
const ApplicationCost = require('../../../src/models/triage/applicationCost.model')

const LTD_CO = { id: 'limited-company', canApplyOnline: true }

const routePath = '/selected/confirm'
const expectedActivitiesPath = '/select/bespoke/limited-company/waste'
const nextRoutePath = `/bespoke-apply-offline` // TODO: Change to task list when that has been implemented for bespoke

let getRequest
let postRequest

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(AuthService.prototype, 'getToken').value(() => DUMMY_AUTH_TOKEN)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(ApplicationCost, 'getApplicationCostForApplicationId').callsFake(async () => mocks.applicationCostModel)
  sandbox.stub(Application, 'getPermitHolderTypeForApplicationId').callsFake(async () => LTD_CO)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Triage confirm costs page tests:', () => {
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
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Confirm activities and assessments')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Start application')
      Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)
    })

    lab.test('GET provides correct activity link', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('change-activities')).to.exist()
      Code.expect(doc.getElementById('change-activities').getAttribute('href')).to.equal(expectedActivitiesPath)
    })

    lab.experiment('GET displays the correct costs', () => {
      lab.test('should include text for each item', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        mocks.applicationCostModel.items.forEach(({ description, costText }, index) => {
          const prefix = `cost-item-${index}`
          Code.expect(doc.getElementById(`${prefix}-desc`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-desc`).firstChild.nodeValue.trim()).to.equal(description)
          Code.expect(doc.getElementById(`${prefix}-cost`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-cost`).firstChild.nodeValue.trim()).to.equal(costText)
        })
      })
      lab.test('should include text for total', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById('total-desc')).to.exist()
        Code.expect(doc.getElementById('total-desc').firstChild.nodeValue.trim()).to.equal(mocks.applicationCostModel.total.description)
        Code.expect(doc.getElementById('total-cost')).to.exist()
        Code.expect(doc.getElementById('total-cost').firstChild.nodeValue.trim()).to.equal(mocks.applicationCostModel.total.costText)
      })
    })
  })

  lab.experiment('POST:', () => {
    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('POST confirmation redirects to next route', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })
  })
})