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

const routePath = '/site/site-name'

let fakeSite = {
  id: 'dff66fce-18b8-e711-8119-5065f38ac931',
  name: 'THE_SITE_NAME',
  applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
  applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461',
  save: (authToken) => {}
}

lab.beforeEach((done) => {
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

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub

  Site.prototype.save = siteSaveStub
  Site.getByApplicationId = getByApplicationIdStub
})

lab.experiment('Site page tests:', () => {
  lab.test('The page should have a back link', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    // Empty site details response
    Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })
  })

  lab.test('GET /site/site-name returns the site page correctly when it is a new application', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    // Empty site details response
    Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return {}
    }

    server.inject(request, (res) => {
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
      Code.expect(element.getAttribute('value')).to.equal('')

      element = doc.getElementById('site-site-name-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')
    })
  })

  lab.test('GET /site/site-name returns the site page correctly when there is an existing Site name', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    server.inject(request, (res) => {
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
      Code.expect(element.getAttribute('value')).to.equal(fakeSite.name)

      element = doc.getElementById('site-site-name-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')
    })
  })

  lab.test('POST /site/site-name success (new Site) redirects to the task list route', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-name': 'My Site'
      }
    }

    // Empty site details response
    Site.getByApplicationId = (authToken, applicationId, applicationLineId) => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')
    })
  })

  lab.test('POST /site/site-name success (existing Site) redirects to the task list route', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-name': 'My Site'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')
    })
  })

  lab.test('POST /site/site-name redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    }

    CookieService.validateCookie = () => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })
  })

  lab.test('POST /site/site-name shows the error message summary panel when the site data is invalid', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-name': ''
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      const element = doc.getElementById('error-summary')

      Code.expect(element).to.exist()
    })
  })

  lab.test('POST /site/site-name shows an error message when the site name is blank', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-name': ''
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element
      let errorMessage = 'Enter the site name'

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      // Site name field error
      element = doc.getElementById('site-name-error').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)
    })
  })

  lab.test('POST /site/site-name shows an error message when the site name contains invalid characters', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-name': '___INVALID_SITE_NAME___'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element
      let errorMessage = 'The site name cannot contain any of these characters: ^ | _ ~ ¬ `'

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      // Site name field error
      element = doc.getElementById('site-name-error').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)
    })
  })

  lab.test('POST /site/site-name shows an error message when the site name is too long', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'site-name': '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element
      let errorMessage = 'Enter a shorter site name with no more than 170 characters'

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      // Site name field error
      element = doc.getElementById('site-name-error').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)
    })
  })
})
