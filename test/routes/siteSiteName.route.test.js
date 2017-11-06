'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Site = require('../../src/models/location.model')

let validateCookieStub
let siteSaveStub
let getByApplicationIdStub

const routePath = '/site/site-name'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const fakeSite = {
  id: 'dff66fce-18b8-e711-8119-5065f38ac931',
  name: 'THE_SITE_NAME',
  applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
  applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461',
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

  siteSaveStub = Site.prototype.save
  Site.prototype.save = (authToken) => {}

  getByApplicationIdStub = Site.getByApplicationId
  Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
    return fakeSite
  }
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub

  Site.prototype.save = siteSaveStub
  Site.getByApplicationId = getByApplicationIdStub
})

const checkPageElements = async (request, expectedValue) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('site-site-name-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What's the site name?`)

  element = doc.getElementById('site-site-name-subheading').firstChild
  Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('site-name-label').firstChild
  Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('site-name-hint').firstChild
  Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('site-name')
  Code.expect(element.getAttribute('value')).to.equal(expectedValue)

  element = doc.getElementById('site-site-name-submit').firstChild
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
  element = doc.getElementById('site-name-error').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Site Name page tests:', () => {
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

  lab.test('GET /site/site-name returns the site page correctly when it is a new application', async () => {
    // Empty site details response
    Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return {}
    }
    checkPageElements(getRequest, '')
  })

  lab.test('GET /site/site-name returns the site page correctly when there is an existing Site name', async () => {
    checkPageElements(getRequest, fakeSite.name)
  })

  lab.test('POST /site/site-name success (new Site) redirects to the Site Grid Reference route', async () => {
    postRequest.payload['site-name'] = 'My Site'

    // Empty site details response
    Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return undefined
    }

    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/site/grid-reference')
  })

  lab.test('POST ' + routePath + ' success (existing Site) redirects to the Site Grid Reference route', async () => {
    postRequest.payload['site-name'] = 'My Site'
    const res = await server.inject(postRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/site/grid-reference')
  })

  lab.test('POST ' + routePath + 'shows an error message when the site name is blank', async () => {
    postRequest.payload['site-name'] = ''
    await checkValidationError('Enter the site name')
  })

  lab.test('POST ' + routePath + ' shows an error message when the site name contains invalid characters', async () => {
    postRequest.payload['site-name'] = '___INVALID_SITE_NAME___'
    await checkValidationError('The site name cannot contain any of these characters: ^ | _ ~ ¬ `')
  })

  lab.test('POST ' + routePath + ' shows an error message when the site name is too long', async () => {
    postRequest.payload['site-name'] = '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
    await checkValidationError('Enter a shorter site name with no more than 170 characters')
  })
})
