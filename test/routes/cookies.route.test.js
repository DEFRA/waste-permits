'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

const routePath = '/information/cookies'

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Cookies page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(true, true, true)

  lab.test(`GET ${routePath} success`, async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'cookies-description-paragraph-1',
      'cookies-description-paragraph-2',
      'cookies-description-paragraph-3',
      'cookies-description-list-item-1',
      'cookies-description-list-item-2',
      'cookies-description-list-item-3',
      'cookies-description-link-prefix',
      'cookies-description-link'])
  })

  lab.test(`GET ${routePath} success check tabular elements exist`, async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    // Test the tabular content exists
    GeneralTestHelper.checkElementsExist(doc, [
      'session-cookies-intro-0',
      'defra-session-cookie-name',
      'defra-session-cookie-purpose',
      'defra-session-cookie-expires',
      'defra-cserf-token-cookie-name',
      'defra-cserf-token-cookie-purpose',
      'defra-cserf-token-cookie-expires',
      'analytics-cookie-intro-0',
      'analytics-cookie-intro-1',
      'analytics-cookie-intro-2',
      'ga-cookie-name',
      'ga-cookie-purpose',
      'ga-cookie-expires',
      'gid-cookie-name',
      'gid-cookie-purpose',
      'gid-cookie-expires',
      'gat-cookie-name',
      'gat-cookie-purpose',
      'gat-cookie-expires',
      'introductory-message-cookie-intro-0',
      'seen-message-cookie-name',
      'seen-message-cookie-purpose',
      'seen-message-cookie-expires'
    ])
  })

  lab.test(`GET ${routePath} success check number of tabular elements don't exceed expected`, async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    // Test the tabular content does not exist
    GeneralTestHelper.checkElementsDoNotExist(doc, [
      'session-cookies-intro-1',
      'analytics-cookie-intro-3',
      'introductory-message-cookie-intro-1'
    ])
  })
})
