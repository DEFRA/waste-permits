'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../index')

const DOMParser = require('xmldom').DOMParser

<<<<<<< HEAD
let validateCookieStub
=======
let validateTokenStub
>>>>>>> c32ba3f3703d2dafc6d1d6336c96dfec9fc08e02

let routePath = '/start/start-or-open-saved'

lab.beforeEach((done) => {
  // Stub methods
<<<<<<< HEAD
  validateCookieStub = server.methods.validateCookie
  server.methods.validateCookie = (cookie) => {
    return true
=======
  validateTokenStub = server.methods.validateToken
  server.methods.validateToken = () => {
    return 'my_token'
>>>>>>> c32ba3f3703d2dafc6d1d6336c96dfec9fc08e02
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
<<<<<<< HEAD
  server.methods.validateCookie = validateCookieStub
=======
  server.methods.validateToken = validateTokenStub
>>>>>>> c32ba3f3703d2dafc6d1d6336c96dfec9fc08e02

  done()
})

lab.experiment('Start or Open Saved page tests:', () => {
  lab.test('GET returns the Start or Open Saved page correctly', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('start-or-open-saved-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Apply for a standard rules waste permit')

      element = doc.getElementById('start-application')
      Code.expect(element).to.exist()

      element = doc.getElementById('open-application')
      Code.expect(element).to.exist()

      element = doc.getElementById('start-or-open-saved-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST on Start or Open Saved page success redirects to the Site route', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'started-application': 'yes'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/site')

      done()
    })
  })

<<<<<<< HEAD
=======
  lab.test('POST Start or Open Saved page redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
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

>>>>>>> c32ba3f3703d2dafc6d1d6336c96dfec9fc08e02
  lab.test('POST Start or Open Saved page shows the error message summary panel when new or open has not been selected', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element
      let errorMessage = 'Select start new or open a saved application'

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      // Site name field error
      element = doc.getElementById('started-application-error').firstChild
      Code.expect(element.nodeValue).to.equal(errorMessage)

      done()
    })
  })
})
