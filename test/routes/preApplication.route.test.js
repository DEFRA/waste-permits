'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CookieService = require('../../src/services/cookie.service')
const CharityDetail = require('../../src/models/charityDetail.model')
const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

const routePath = '/pre-application'

const getRequest = {
  method: 'GET',
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
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(CharityDetail, 'get').value(() => mocks.charityDetail)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Pre Application (Have you discussed this application with us?) page tests:', () => {
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
})
