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

lab.experiment('Select a permit page tests:', () => {
  lab.test('GET /permit/select success ', (done) => {
    const request = {
      method: 'GET',
      url: '/permit/select',
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
      done()
    })
  })

  lab.test('GET /permit/select redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'GET',
      url: '/permit/select',
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
