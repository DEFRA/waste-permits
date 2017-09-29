'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')

const StandardRule = require('../../src/models/standardRule.model')
const CookieService = require('../../src/services/cookie.service')

let generateCookieStub
let validateCookieStub
let standardRuleGetByCodeStub

let routePath = '/task-list'

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

lab.beforeEach((done) => {
  // Stub methods
  generateCookieStub = CookieService.generateCookie
  CookieService.generateCookie = (reply) => {
    return fakeCookie
  }

  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (cookie) => {
    return true
  }

  standardRuleGetByCodeStub = StandardRule.getByCode
  StandardRule.getByCode = (authToken, code) => {
    return {
      name: 'Metal recycling, vehicle storage, depollution and dismantling facility',
      limits: 'Less than 25,000 tonnes a year of waste metal and less than 5,000 tonnes a year of waste motor vehicles',
      code: 'SR2015 No 18',
      codeForId: 'sr2015-no-18'
    }
  }
  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.generateCookie = generateCookieStub
  CookieService.validateCookie = validateCookieStub
  StandardRule.prototype.getByCode = standardRuleGetByCodeStub

  done()
})

lab.experiment('Task List page tests:', () => {
  lab.test('GET /task-list success ', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
      done()
    })
  })

  lab.test('GET /task-list redirects to error screen when the user token is invalid', (done) => {
    const request = {
      method: 'GET',
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
})
