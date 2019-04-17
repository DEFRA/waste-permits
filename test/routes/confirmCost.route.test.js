'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../server')
const GeneralTestHelper = require('./generalTestHelper.test')
const Mocks = require('../helpers/mocks')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const ApplicationCost = require('../../src/models/applicationCost.model')

const routePath = '/confirm-cost'
const expectedWasteActivitiesPath = '/waste-activity'
const nextRoutePath = '/task-list'

let getRequest
let postRequest

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(ApplicationCost, 'getApplicationCostForApplicationId').callsFake(async () => mocks.applicationCostModel)
  sandbox.stub(RecoveryService, 'createApplicationContext').callsFake(async () => mocks.recovery)
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
      delete mocks.context.mcpType
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('change-waste-activities')).to.exist()
      Code.expect(doc.getElementById('change-waste-activities').getAttribute('href')).to.equal(expectedWasteActivitiesPath)
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
