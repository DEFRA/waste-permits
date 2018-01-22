'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')

const StandardRule = require('../../src/models/standardRule.model')
const ApplicationLine = require('../../src/models/applicationLine.model')

let validateCookieStub
let standardRuleListStub
let standardRuleGetByCodeStub
let applicationLineSaveStub

const routePath = '/permit/select'

const fakeStandardRule = {
  id: 'bd610c23-8ba7-e711-810a-5065f38a5b01',
  name: 'Metal recycling, vehicle storage, depollution and dismantling facility',
  limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
  code: 'SR2015 No 18',
  codeForId: 'sr2015-no-18'
}

lab.beforeEach(() => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  standardRuleListStub = StandardRule.list
  StandardRule.list = () => [fakeStandardRule]

  standardRuleGetByCodeStub = StandardRule.getByCode
  StandardRule.getByCode = () => fakeStandardRule

  applicationLineSaveStub = ApplicationLine.save
  ApplicationLine.prototype.save = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  StandardRule.prototype.list = standardRuleListStub
  StandardRule.getByCode = standardRuleGetByCodeStub
  ApplicationLine.prototype.save = applicationLineSaveStub
})

lab.experiment('Select a permit page tests:', () => {
  lab.test('The page should NOT have a back link', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test('GET /permit/select returns the permit selection page correctly', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Select a permit')

    element = doc.getElementById('select-permit-hint-text')
    Code.expect(element).to.exist()

    element = doc.getElementById('permit-type-description')
    Code.expect(element).to.exist()

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

  lab.test('POST /permit/select success redirects to the task list route', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'chosen-permit': 'SR2010 No 4'
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/task-list')
  })

  lab.test('GET /permit/select redirects to error screen when the user token is invalid', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    CookieService.validateCookie = () => {
      return undefined
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/error')
  })

  lab.test('POST /permit/select shows the error message summary panel when the site data is invalid', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'chosen-permit': ''
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('error-summary')

    Code.expect(element).to.exist()
  })

  lab.test('POST /permit/select shows an error message when no permit is selected', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
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
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'chosen-permit': 'not a real permit'
      }
    }

    const res = await server.inject(request)
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
