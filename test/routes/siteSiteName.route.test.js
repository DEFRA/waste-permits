'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let validateCookieStub
let dynamicsCreateStub
let dynamicsUpdateStub
let dynamicsSearchStub

let routePath = '/site/site-name'

// Dynamics Site data
let fakeData = {
  '@odata.etag': 'W/"697235"',
  defra_name: 'THE_SITE_NAME',
  defra_locationid: '22c353ab-72ae-e711-810c-5065f38a5b01'
}

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (request) => {
    return true
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return '7a8e4354-4f24-e711-80fd-5065f38a1b01'
  }

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => {
    return dataObject.id
  }

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [fakeData]
    }
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub

  done()
})

lab.experiment('Site page tests:', () => {
  lab.test('The page should have a back link', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    // Empty site details response
    DynamicsDalService.prototype.search = (query) => {
      return {
        '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
        value: []
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()

      done()
    })
  })

  lab.test('GET /site/site-name returns the site page correctly when it is a new application', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    // Empty site details response
    DynamicsDalService.prototype.search = (query) => {
      return {
        '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
        value: []
      }
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

      done()
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
      Code.expect(element.getAttribute('value')).to.equal(fakeData.defra_name)

      element = doc.getElementById('site-site-name-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
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
    DynamicsDalService.prototype.search = (query) => {
      return {
        '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
        value: []
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')

      done()
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

      done()
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
      done()
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

      done()
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

      done()
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

      done()
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

      done()
    })
  })
})
