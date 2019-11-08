'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const WasteWeights = require('../../src/models/wasteWeights.model')
const Application = require('../../src/persistence/entities/application.entity')
const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/waste-weight/0'
const nextPath = '/task-list'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)

  sandbox.stub(WasteWeights, 'getForActivity').resolves(new WasteWeights({ activityDisplayName: 'Fake activity', hasHazardousWaste: true }))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Waste weight', () => {
  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('provides the correct page', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Enter the waste weights for Fake activity')
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'non-hazardous-throughput': '1',
          'non-hazardous-maximum': '2',
          'has-hazardous': 'true',
          'hazardous-throughput': '3',
          'hazardous-maximum': '4'
        }
      }
      sandbox.stub(WasteWeights.prototype, 'save')
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextPath)
    })

    lab.test('displays errors (no values supplied)', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      GeneralTestHelper.checkValidationMessage(doc, 'non-hazardous-throughput', 'You must enter a number')
      GeneralTestHelper.checkValidationMessage(doc, 'non-hazardous-maximum', 'You must enter a number')
    })
  })
})
