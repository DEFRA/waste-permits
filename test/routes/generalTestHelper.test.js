'use strict'

const Code = require('code')
const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

const timeoutPath = '/errors/timeout'

let getRequest, postRequest

module.exports = class GeneralTestHelper {
  constructor (lab, routePath) {
    this.lab = lab
    this.routePath = routePath
  }

  test (excludePostTests = false) {
    const {lab, routePath} = this

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }

      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('General tests:', () => {
      lab.test(`GET ${routePath} redirects to timeout screen when the cookie is not found`, async () => {
        CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_NOT_FOUND

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(timeoutPath)
      })

      lab.test(`GET ${routePath} redirects to timeout screen when the cookie has expired`, async () => {
        CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_EXPIRED

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(timeoutPath)
      })

      // TODO: Find a way to successfully test the POST on upload screens
      if (!excludePostTests) {
        lab.test(`POST ${routePath} redirects to timeout screen when the cookie is not found`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_NOT_FOUND

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(timeoutPath)
        })

        lab.test(`POST ${routePath} redirects to timeout screen when the cookie has expired`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_EXPIRED

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(timeoutPath)
        })
      }
    })
  }
}
