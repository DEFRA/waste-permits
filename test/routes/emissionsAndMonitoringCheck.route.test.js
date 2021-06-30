'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Code = require('@hapi/code')
const Mocks = require('../helpers/mocks')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const DataStore = require('../../src/models/dataStore.model')
const { COOKIE_RESULT } = require('../../src/constants')

const GeneralTestHelper = require('./generalTestHelper.test')

const routePath = '/emissions/check'
const yesPath = '/emissions/upload'
const noPath = '/task-list'

let sandbox
let mocks

lab.beforeEach(() => {
  // Stub methods
  mocks = new Mocks()
  sandbox = sinon.createSandbox()

  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(DataStore, 'get').value(() => { return { data: { emissionsAndMonitoringDetailsRequired: true } } })
  sandbox.stub(DataStore, 'save').value(() => false)
})

lab.afterEach(() => {
  // Restore stubbed methods
  sandbox.restore()
})

lab.experiment('Emissions and monitoring check page tests:', () => {
  // new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('Success', () => {
      lab.test('Check the page loads', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Does the operation make any point source emissions to air, water or land?')
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('Success - yes', async () => {
      // Choose 'Yes' and click 'Continue'
      postRequest.payload['emissions-made'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(yesPath)
    })

    lab.test('Success - no', async () => {
      // Choose 'No' and click 'Continue'
      postRequest.payload['emissions-made'] = 'no'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(noPath)
    })

    lab.test('Invalid input', async () => {
      // Choose nothing and click 'Continue' (hence an empty payload)
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'emissions-made', 'Select yes or no')
    })
  })
})
