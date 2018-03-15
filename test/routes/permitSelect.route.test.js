'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')

const StandardRule = require('../../src/models/standardRule.model')
const Application = require('../../src/models/application.model')
const ApplicationLine = require('../../src/models/applicationLine.model')
const Payment = require('../../src/models/payment.model')
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

const routePath = '/permit/select'
const nextRoutePath = '/task-list'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

let postRequest

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationName: 'APPLICATION_NAME'
}

const fakeStandardRule = {
  id: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
  permitName: 'Metal recycling, vehicle storage, depollution and dismantling facility',
  limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
  code: 'SR2015 No 18',
  codeForId: 'sr2015-no-18'
}

lab.beforeEach(() => {
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationLine.prototype, 'save').value(() => {})
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
  sandbox.stub(StandardRule, 'list').value(() => [fakeStandardRule])
  sandbox.stub(StandardRule, 'getByCode').value(() => fakeStandardRule)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Select a permit page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.test('The page should NOT have a back link', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the permit selection page correctly`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Select a permit')

    // Not visible for MVP
    element = doc.getElementById('select-permit-hint-text')
    Code.expect(element).to.not.exist()

    // Not visible for MVP
    element = doc.getElementById('permit-type-description')
    Code.expect(element).to.not.exist()

    // Not visible for MVP
    element = doc.getElementById('back-to-all-permit-groups-link')
    Code.expect(element).to.not.exist()

    element = doc.getElementById('chosen-permit-sr2015-no-18-name').firstChild
    Code.expect(element.nodeValue).to.include('Metal recycling, vehicle storage, depollution and dismantling facility')

    element = doc.getElementById('chosen-permit-sr2015-no-18-weight').firstChild
    Code.expect(element.nodeValue).to.include('Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles')

    element = doc.getElementById('chosen-permit-sr2015-no-18-code').firstChild
    Code.expect(element.nodeValue).to.equal('SR2015 No 18')

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  })

  lab.test('POST /permit/select success redirects to the next route', async () => {
    postRequest.payload['chosen-permit'] = 'SR2010 No 4'

    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(nextRoutePath)
  })

  lab.test('POST /permit/select shows the error message summary panel when the site data is invalid', async () => {
    postRequest.payload['chosen-permit'] = ''

    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('error-summary')

    Code.expect(element).to.exist()
  })

  lab.test('POST /permit/select shows an error message when no permit is selected', async () => {
    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element
    let errorMessage = 'Select the permit you want'

    // Panel summary error item
    element = doc.getElementById('error-summary-list-item-0').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)

    // Chosen permit ID error
    element = doc.getElementById('chosen-permit-error').firstChild.firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)
  })

  lab.test('POST /permit/select shows an error message when the permit value is not allowed', async () => {
    postRequest.payload['chosen-permit'] = 'not a real permit'

    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element
    let errorMessage = 'Select a valid permit'

    // Panel summary error item
    element = doc.getElementById('error-summary-list-item-0').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)

    // Chosen permit ID error
    element = doc.getElementById('chosen-permit-error').firstChild.firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)
  })
})
