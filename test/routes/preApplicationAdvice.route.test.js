'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const PreApplicationModel = require('../../src/models/preApplication.model')

const DataStore = require('../../src/models/dataStore.model')

const Routes = require('../../src/routes')
const { PRE_APPLICATION_ADVICE } = Routes

const nextRoutePath = Routes[PRE_APPLICATION_ADVICE.nextRoute].path
const wantAdvicePath = PRE_APPLICATION_ADVICE.wantAdvicePath

let sandbox

const routePath = PRE_APPLICATION_ADVICE.path

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

const postRequest = {
  method: 'POST',
  url: routePath,
  headers: {},
  payload: {}
}

let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(PreApplicationModel, 'get').value(() => mocks.preApplication)
  sandbox.stub(PreApplicationModel.prototype, 'save').callsFake(async () => undefined)
  sandbox.stub(DataStore, 'get').callsFake(() => mocks.dataStore)
  sandbox.stub(DataStore.prototype, 'save').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Pre Application (Have you received pre-application advice?) page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.test('The page should have a back link', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    const element = doc.getElementById('back-link')
    Code.expect(element).to.exist()
  })

  lab.test(`GET ${routePath} success`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)
  })

  lab.test(`When 'Received advice' selected - redirects to ${nextRoutePath}`, async () => {
    postRequest.payload = { 'pre-application-advice': 'received-advice' }

    const res = await server.inject(postRequest)

    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers.location).to.equal(nextRoutePath)
  })

  lab.test(`When 'No advice' selected - redirects to ${nextRoutePath}`, async () => {
    postRequest.payload = { 'pre-application-advice': 'no-advice' }

    const res = await server.inject(postRequest)

    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers.location).to.equal(nextRoutePath)
  })

  lab.test(`When 'Want advice' selected - redirects to ${wantAdvicePath}`, async () => {
    postRequest.payload = { 'pre-application-advice': 'want-advice' }

    const res = await server.inject(postRequest)

    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers.location).to.equal(wantAdvicePath)
  })
})
