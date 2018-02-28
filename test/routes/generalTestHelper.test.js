'use strict'

const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../server')

const Application = require('../../src/models/application.model')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

const cookieTimeoutPath = '/errors/timeout'
const startAtBeginningRoutePath = '/errors/order/start-at-beginning'
const alreadySubmittedRoutePath = '/errors/order/done-cant-go-back'

let getRequest, postRequest

module.exports = class GeneralTestHelper {
  constructor (lab, routePath) {
    this.lab = lab
    this.routePath = routePath
  }

  // TODO: make excludeAlreadySubnmittedTest default to false
  // new GeneralTestHelper(lab, routePath).test(false, false, true)
  // to become
  // new GeneralTestHelper(lab, routePath).test() i.e. all exclude = false
  test (excludeCookieGetTests = false, excludeCookiePostTests = false, excludeAlreadySubnmittedTest = true) {
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

    lab.afterEach(() => { })

    lab.experiment('General tests:', () => {
      if (!excludeCookieGetTests) {
        lab.test(`GET ${routePath} redirects to timeout screen when the cookie is not found`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_NOT_FOUND

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(startAtBeginningRoutePath)
        })

        lab.test(`GET ${routePath} redirects to timeout screen when the cookie has expired`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_EXPIRED

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(cookieTimeoutPath)
        })
      }

      if (!excludeCookiePostTests) {
        lab.test(`POST ${routePath} redirects to timeout screen when the cookie is not found`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_NOT_FOUND

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(startAtBeginningRoutePath)
        })

        lab.test(`POST ${routePath} redirects to timeout screen when the cookie has expired`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_EXPIRED

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(cookieTimeoutPath)
        })
      }

      if (!excludeAlreadySubnmittedTest) {
        lab.test('Redirects to the Already Submitted screen if the application has already been submitted', async () => {
          Application.prototype.isSubmitted = () => true

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(alreadySubmittedRoutePath)
        })
      }

      lab.test(`GET ${routePath} page should have the beta banner`, async () => {
        const res = await server.inject(getRequest)

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.payload, 'text/html')

        if (!doc) {
          console.log('A problem')
        }

        const element = doc.getElementById('beta-banner')
        Code.expect(element).to.exist()
      })
    })
  }
}
