'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub

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

lab.experiment('Which management system will you use? page tests:', () => {
  lab.test('GET /management-system success ', (done) => {
    const request = {
      method: 'GET',
      url: '/management-system',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
      done()
    })
  })

  lab.test('GET /management-system redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'GET',
      url: '/management-system',
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
})
