'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Site = require('../../src/models/site.model')

let validateCookieStub
let siteSaveStub
let getByApplicationIdStub

const routePath = '/site/grid-reference'

let fakeSite = {
  id: 'dff66fce-18b8-e711-8119-5065f38ac931',
  name: 'THE SITE NAME',
  gridReference: 'AB1234567890',
  applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
  applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461',
  save: (authToken) => {}
}

lab.beforeEach(() => {
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

lab.experiment('Site Grid Reference page tests:', () => {
  lab.test('The page should have a back link', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    // Empty site details response
    Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return undefined
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    const element = doc.getElementById('back-link')
    Code.expect(element).to.exist()
  })

  lab.test('GET /site/grid-reference returns the site grid reference page correctly when the grid reference has not been entered yet', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    // Empty site details response
    Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('site-grid-reference-heading').firstChild
    Code.expect(element.nodeValue).to.equal(`What's the grid reference for the centre of the site?`)

    element = doc.getElementById('site-grid-reference-label').firstChild
    Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('site-grid-reference-hint').firstChild
    Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('site-grid-reference')
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById('site-grid-reference-summary').firstChild
    Code.expect(element.nodeValue).to.exist()

    // TODO check this page element exists
    // element = doc.getElementById('site-grid-reference-finder-link ').firstChild
    // Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('grid-reference-help-list').firstChild
    Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('site-grid-reference-submit').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  })

  lab.test('GET /site/grid-reference returns the site page correctly when there is an existing Site grid reference', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('site-grid-reference-heading').firstChild
    Code.expect(element.nodeValue).to.equal(`What's the grid reference for the centre of the site?`)

    element = doc.getElementById('site-grid-reference-label').firstChild
    Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('site-grid-reference-hint').firstChild
    Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('site-grid-reference')
    Code.expect(element.getAttribute('value')).to.equal(fakeSite.gridReference)

    element = doc.getElementById('site-grid-reference-summary').firstChild
    Code.expect(element.nodeValue).to.exist()

    // TODO check this page element exists
    // element = doc.getElementById('site-grid-reference-finder-link ').firstChild
    // Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('grid-reference-help-list').firstChild
    Code.expect(element.nodeValue).to.exist()

    element = doc.getElementById('site-grid-reference-submit').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  })

  // lab.test('POST /site/grid-reference success (new grid reference) redirects to the Task List route', async () => {
  //   const request = {
  //     method: 'POST',
  //     url: routePath,
  //     headers: {},
  //     payload: {
  //       'grid-reference': fakeSite.gridReference
  //     }
  //   }
  //
  //   // Empty site details response
  //   Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
  //     return undefined
  //   }
  //
  //   const res = await server.inject(request)
  //   Code.expect(res.statusCode).to.equal(302)
  //   Code.expect(res.headers['location']).to.equal('/task-list')
  // })

  // lab.test('POST /site/grid-reference success (existing grid reference) redirects to the Task List route', async () => {
  //   const request = {
  //     method: 'POST',
  //     url: routePath,
  //     headers: {},
  //     payload: {
  //       'grid-reference': fakeSite.gridReference
  //     }
  //   }
  //
  //   const res = await server.inject(request)
  //   Code.expect(res.statusCode).to.equal(302)
  //   Code.expect(res.headers['location']).to.equal('/site/grid-reference')
  // })

  lab.test('POST /site/grid-reference redirects to error screen when the user token is invalid', async () => {
    const request = {
      method: 'POST',
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

  lab.test('POST /site/grid-reference shows an error message when the site grid reference is blank', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-grid-reference': ''
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element
    let errorMessage = 'Enter a grid reference'

    // Panel summary error item
    element = doc.getElementById('error-summary-list-item-0').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)

    // Site grid reference field error
    element = doc.getElementById('site-grid-reference-error').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)
  })

  lab.test('POST /site/grid-reference shows an error message when the site grid reference is whitespace', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-grid-reference': '             '
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element
    let errorMessage = 'Enter a grid reference'

    // Panel summary error item
    element = doc.getElementById('error-summary-list-item-0').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)

    // Site grid reference field error
    element = doc.getElementById('site-grid-reference-error').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)
  })

  lab.test('POST /site/grid-reference shows an error message when the site grid reference is in the wrong format', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-grid-reference': 'AB123456789X'
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element
    let errorMessage = 'Make sure that the grid reference has 2 letters and 10 digits'

    // Panel summary error item
    element = doc.getElementById('error-summary-list-item-0').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)

    // Site grid reference field error
    element = doc.getElementById('site-grid-reference-error').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)
  })
})
