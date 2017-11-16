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

const routePath = '/site/grid-reference'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const fakeLocation = {
  id: 'dff66fce-18b8-e711-8119-5065f38ac931',
  name: 'THE SITE NAME',
  applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
  applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461',
  save: (authToken) => {}
}

const fakeLocationDetail = {
  id: 'LOCATION_DETAIL_ID',
  gridReference: 'AB1234567890',
  locationId: 'LOCATION_ID',
  save: (authToken) => {}
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

  locationSaveStub = Location.prototype.save
  Location.prototype.save = (authToken) => {}

  locationDetailSaveStub = LocationDetail.prototype.save
  LocationDetail.prototype.save = (authToken) => {}

  locationGetByApplicationIdStub = Location.getByApplicationId
  Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
    return fakeLocation
  }

  getByLocationIdStub = LocationDetail.getByLocationId
  LocationDetail.getByLocationId = (authToken, locationId) => {
    return fakeLocationDetail
  }

  siteNameAndLocationUpdateCompletenessStub = SiteNameAndLocation.updateCompleteness
  SiteNameAndLocation.updateCompleteness = (authToken, applicationId, applicationLineId) => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub

  Location.prototype.save = locationSaveStub
  LocationDetail.prototype.save = locationDetailSaveStub
  Location.getByApplicationId = locationGetByApplicationIdStub
  LocationDetail.getByLocationId = getByLocationIdStub
  SiteNameAndLocation.updateCompleteness = siteNameAndLocationUpdateCompletenessStub
})

const checkPageElements = async (getRequest, expectedValue) => {
  const res = await server.inject(getRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What's the grid reference for the centre of the site?`)

  const elementIds = [
    'back-link',
    'defra-csrf-token',
    'site-grid-reference-label',
    'site-grid-reference-hint',
    'site-grid-reference-summary',
    'site-grid-reference-finder-link',
    'grid-reference-help-list'
  ]
  for (let id of elementIds) {
    element = doc.getElementById(id)
    Code.expect(doc.getElementById(id)).to.exist()
  }

  element = doc.getElementById('site-grid-reference')
  Code.expect(element.getAttribute('value')).to.equal(expectedValue)

  element = doc.getElementById('submit-button').firstChild
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

lab.experiment('Site Grid Reference page tests:', () => {

  lab.experiment('General tests:', () => {
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
  })

  lab.experiment('GET:', () => {
    lab.test('GET ' + routePath + ' returns the Site grid reference page correctly when the grid reference has not been entered yet', async () => {
      LocationDetail.getByLocationId = (authToken, locationId) => {
        return undefined
      }

      // Empty location details response
      Location.getByApplicationId = (authToken, applicationId, applicationLineId) => {
        return {}
      }

      await checkPageElements(getRequest, '')
    })

    lab.test('GET ' + routePath + ' returns the Site Grid Reference page correctly when there is an existing grid reference', async () => {
      await checkPageElements(getRequest, fakeLocationDetail.gridReference)
    })
  })

  lab.experiment('POST:', () => {
    lab.test('POST ' + routePath + ' shows an error message when the location grid reference is blank', async () => {
      postRequest.payload['site-grid-reference'] = ''
      await checkValidationError('Enter a grid reference')
    })

    lab.test('POST ' + routePath + ' shows an error message when the location grid reference is whitespace', async () => {
      postRequest.payload['site-grid-reference'] = '            '
      await checkValidationError('Enter a grid reference')
    })

    lab.test('POST ' + routePath + ' shows an error message when the location grid reference is in the wrong format', async () => {
      const expectedErrorMessage = 'Make sure that the grid reference has 2 letters and 10 digits'

      // Wrong format
      postRequest.payload['site-grid-reference'] = 'AB123456789X'
      await checkValidationError(expectedErrorMessage)
      postRequest.payload['site-grid-reference'] = 'ab123456789X'
      await checkValidationError(expectedErrorMessage)
      postRequest.payload['site-grid-reference'] = 'ABX123456789'
      await checkValidationError(expectedErrorMessage)

      // Not enough characters
      postRequest.payload['site-grid-reference'] = 'AB123456789'
      await checkValidationError(expectedErrorMessage)

      // Too many characters
      postRequest.payload['site-grid-reference'] = 'AB12345678900'
      await checkValidationError(expectedErrorMessage)
    })

    lab.test('POST ' + routePath + ' accepts a grid reference that contains whitespace', async () => {
      postRequest.payload['site-grid-reference'] = '      A       B   123  4 5 6 789         0      '

      // Empty location details response
      LocationDetail.getByLocationId = (authToken, applicationId, applicationLineId) => {
        return undefined
      }

      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/site/address/postcode')
    })

    lab.test('POST /' + routePath + ' success (new grid reference) redirects to the Site Postcode route', async () => {
      postRequest.payload['site-grid-reference'] = fakeLocationDetail.gridReference

      // Empty location details response
      LocationDetail.getByLocationId = (authToken, applicationId, applicationLineId) => {
        return undefined
      }

      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/site/address/postcode')
    })

    lab.test('POST ' + routePath + ' success (existing grid reference) redirects to the Site Postcode route', async () => {
      postRequest.payload['site-grid-reference'] = fakeLocationDetail.gridReference

      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/site/address/postcode')
    })

    lab.test('The completeness is recalculated when the grid reference is updated', async () => {
      postRequest.payload['site-grid-reference'] = fakeLocationDetail.gridReference

      // Empty location details response
      LocationDetail.getByLocationId = (authToken, applicationId, applicationLineId) => {
        return undefined
      }

      const spy = sinon.spy(SiteNameAndLocation, 'updateCompleteness')
      await server.inject(postRequest)
      Code.expect(spy.callCount).to.equal(1)
    })
  })
})
