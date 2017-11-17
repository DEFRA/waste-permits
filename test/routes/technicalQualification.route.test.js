'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub

const routePath = '/technical-qualification'

lab.beforeEach(() => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
})

lab.experiment('Which qualification does the person providing technical management have? page tests:', () => {
  lab.test('The page should have a back link', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('back-link')
    Code.expect(element).to.exist()
  })

  lab.test('GET /technical-qualification success ', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)
  })

  lab.test('GET /technical-qualification redirects to error screen when the user token is invalid', async () => {
    const request = {
      method: 'GET',
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
})
