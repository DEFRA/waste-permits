'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub
let pageNotFoundRoute = '/page-not-found'

lab.beforeEach((done) => {
  // Stub methods

  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => {
    return true
  }
  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  done()
})

let validate404Page = (res) => {
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-not-found-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`We can't find that page`)

  element = doc.getElementById('page-not-found-paragraph').firstChild
  Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('page-not-found-task-list-link').firstChild
  Code.expect(element.nodeValue).to.exist()

  element = doc.getElementById('page-not-found-apply-link').firstChild
  Code.expect(element.nodeValue).to.exist()
}

lab.experiment('Page Not Found (404) page tests:', () => {
  lab.test('GET /page-not-found returns the 404 page correctly when the user has a valid cookie', (done) => {
    const request = {
      method: 'GET',
      url: pageNotFoundRoute,
      headers: {}
    }

    server.inject(request, (res) => {
      validate404Page(res)

      done()
    })
  })

  lab.test('GET /page-not-found redirects to the start page when the user does not have a valid cookie', (done) => {
    const request = {
      method: 'GET',
      url: pageNotFoundRoute,
      headers: {}
    }

    CookieService.validateCookie = () => {
      return false
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/start/start-or-open-saved')
      done()
    })
  })

  lab.test('GET /an-invalid-route shows the 404 page when the user has a valid cookie', (done) => {
    const request = {
      method: 'GET',
      url: '/an-invalid-route',
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(pageNotFoundRoute)
      done()
    })
  })
})
