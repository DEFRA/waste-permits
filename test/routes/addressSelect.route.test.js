'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Location = require('../../src/models/location.model')
const LocationDetail = require('../../src/models/locationDetail.model')
const SiteNameAndLocation = require('../../src/models/taskList/siteNameAndLocation.model')

let validateCookieStub
let locationSaveStub
let locationDetailSaveStub
let locationGetByApplicationIdStub
let getByLocationIdStub
let siteNameAndLocationUpdateCompletenessStub

const routePath = '/site/address/select-address'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const fakeLocation = {
  // id: 'dff66fce-18b8-e711-8119-5065f38ac931',
  // name: 'THE SITE NAME',
  // applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
  // applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461',
  // save: (authToken) => {}
}

const fakeLocationDetail = {
  // id: 'LOCATION_DETAIL_ID',
  // gridReference: 'AB1234567890',
  // locationId: 'LOCATION_ID',
  // save: (authToken) => {}
}

lab.beforeEach(() => {
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (request) => {
    return true
  }

  // locationSaveStub = Location.prototype.save
  // Location.prototype.save = (authToken) => {}

  // locationDetailSaveStub = LocationDetail.prototype.save
  // LocationDetail.prototype.save = (authToken) => {}

  // locationGetByApplicationIdStub = Location.getByApplicationId
  // Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
  //   return fakeLocation
  // }

  // getByLocationIdStub = LocationDetail.getByLocationId
  // LocationDetail.getByLocationId = (authToken, locationId) => {
  //   return fakeLocationDetail
  // }

  // siteNameAndLocationUpdateCompletenessStub = SiteNameAndLocation.updateCompleteness
  // SiteNameAndLocation.updateCompleteness = (authToken, applicationId, applicationLineId) => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub

  // Location.prototype.save = locationSaveStub
  // LocationDetail.prototype.save = locationDetailSaveStub
  // Location.getByApplicationId = locationGetByApplicationIdStub
  // LocationDetail.getByLocationId = getByLocationIdStub
  // SiteNameAndLocation.updateCompleteness = siteNameAndLocationUpdateCompletenessStub
})

const checkPageElements = async (getRequest, expectedValue) => {
  const res = await server.inject(getRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('address-select-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What's the site address?`)

  element = doc.getElementById('postcode-label').firstChild
  Code.expect(element.nodeValue).to.exist()

  // element = doc.getElementById('postcode-value').firstChild
  // Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('change-postcode-link')
  Code.expect(element.getAttribute('value')).to.equal(expectedValue)

  // element = doc.getElementById('manual-address').firstChild
  // Code.expect(element.nodeValue).to.exist()

  // element = doc.getElementById('site-address-label').firstChild
  // Code.expect(element.nodeValue).to.exist()

  // element = doc.getElementById('site-address').firstChild
  // Code.expect(element.nodeValue).to.exist()

  // element = doc.getElementById('manualAddressLink').firstChild
  // Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('select-address-submit').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

const checkValidationError = async (expectedErrorMessage) => {
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element

  // Panel summary error item
  element = doc.getElementById('error-summary-list-item-0').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

  // Location grid reference field error
  element = doc.getElementById('site-grid-reference-error').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Address select page tests:', () => {
  lab.test('The page should have a back link', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('back-link')
    Code.expect(element).to.exist()
  })

  lab.test('GET ' + routePath + ' redirects to error screen when the user token is invalid', async () => {
    CookieService.validateCookie = () => {
      return undefined
    }

    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/error')
  })

  lab.test('POST ' + routePath + ' redirects to error screen when the user token is invalid', async () => {
    CookieService.validateCookie = () => {
      return undefined
    }

    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/error')
  })

  lab.test('GET ' + routePath + ' returns the Address Select page  page correctly when an address has not been selected yet', async () => {
    LocationDetail.getByLocationId = (authToken, locationId) => {
      return undefined
    }

    // // Empty location details response
    // Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
    //   return {}
    // }

    await checkPageElements(getRequest, '')
  })

  // lab.test('GET ' + routePath + ' returns the Address Select page correctly when there is no address selected', async () => {
  //   await checkPageElements(getRequest, fakeLocationDetail.gridReference)
  // })

  // lab.test('GET ' + routePath + ' returns the Address Select page correctly when there is an existing address selected', async () => {
  //   await checkPageElements(getRequest, fakeLocationDetail.gridReference)
  // })

  // lab.test('POST /' + routePath + ' success (new grid reference) redirects to the Site Postcode route', async () => {
  //   postRequest.payload['site-grid-reference'] = fakeLocationDetail.gridReference

  //   // Empty location details response
  //   LocationDetail.getByLocationId = (authToken, applicationId, applicationLineId) => {
  //     return undefined
  //   }

  //   const res = await server.inject(postRequest)
  //   Code.expect(res.statusCode).to.equal(302)
  //   Code.expect(res.headers['location']).to.equal('/site/address/postcode')
  // })

  // lab.test('POST ' + routePath + ' success (existing grid reference) redirects to the Site Postcode route', async () => {
  //   postRequest.payload['site-grid-reference'] = fakeLocationDetail.gridReference

  //   const res = await server.inject(postRequest)
  //   Code.expect(res.statusCode).to.equal(302)
  //   Code.expect(res.headers['location']).to.equal('/site/address/postcode')
  // })

  // lab.test('The completeness is recalculated when the grid reference is updated', async () => {
  //   postRequest.payload['site-grid-reference'] = fakeLocationDetail.gridReference

  //   // Empty location details response
  //   LocationDetail.getByLocationId = (authToken, applicationId, applicationLineId) => {
  //     return undefined
  //   }

  //   const spy = sinon.spy(SiteNameAndLocation, 'updateCompleteness')
  //   await server.inject(postRequest)
  //   Code.expect(spy.callCount).to.equal(1)
  // })
})
