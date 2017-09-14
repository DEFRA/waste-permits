'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')

const DOMParser = require('xmldom').DOMParser

let validateTokenStub

lab.beforeEach((done) => {
  // Stub methods
  validateTokenStub = server.methods.validateToken
  server.methods.validateToken = () => {
    return 'my_token'
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  server.methods.validateToken = validateTokenStub

  done()
})

lab.experiment('Site page tests:', () => {
  lab.test('GET /site returns the site page correctly', (done) => {
    const request = {
      method: 'GET',
      url: '/site',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('site-heading').firstChild
      Code.expect(element.nodeValue).to.equal(`What's the site name?`)

      element = doc.getElementById('site-name-label').firstChild
      Code.expect(element.nodeValue).to.equal('Site name')

      element = doc.getElementById('site-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST /site success redirects to the Contact details route', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {
        'site-name': 'My Site',
        'another-name': 'Other site name'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/contact-details')

      done()
    })
  })

  lab.test('POST /site redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {}
    }

    server.methods.validateToken = () => {
      return undefined
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
      done()
    })
  })

  lab.test('POST /site shows the error message summary panel when the site data is invalid', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {
        'site-name': '',
        'another-name': ''
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

  lab.test('POST /site shows an error message when the site name is blank', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {
        'site-name': '',
        'another-name': ''
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

  lab.test('POST /site shows an error message when the site name contains invalid characters', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {
        'site-name': '___INVALID_SITE_NAME___',
        'another-name': ''
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

  lab.test('POST /site shows an error message when the site name is too long', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {},
      payload: {
        'site-name': '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X',
        'another-name': ''
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
