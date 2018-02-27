'use strict'

const Code = require('code')
const DOMParser = require('xmldom').DOMParser
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

  static checkElementsExist (doc, elementIds) {
    elementIds.forEach((id) => Code.expect(doc.getElementById(id)).to.exist())
  }

  test (excludeCookieGetTests = false, excludeCookiePostTests = false) {
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
      if (!excludeCookieGetTests) {
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
      }

      if (!excludeCookiePostTests) {
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

      lab.test(`GET ${routePath} page should have the privacy footer link`, async () => {
        const res = await server.inject(getRequest)

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.payload, 'text/html')

        if (!doc) {
          console.log('A problem')
        }

        const element = doc.getElementById('footer-privacy-link')
        Code.expect(element).to.exist()
        Code.expect(element.getAttribute('href')).to.equal('/information/privacy')
      })
    })
  }
}
