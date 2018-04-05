'use strict'

const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../server')

const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

const cookieTimeoutPath = '/errors/timeout'
const startAtBeginningRoutePath = '/errors/order/start-at-beginning'
const alreadySubmittedRoutePath = '/errors/order/done-cant-go-back'
const notPaidRoutePath = '/errors/order/card-payment-not-complete'

let getRequest, postRequest

module.exports = class GeneralTestHelper {
  constructor (lab, routePath) {
    this.lab = lab
    this.routePath = routePath
  }

  static checkElementsExist (doc, elementIds) {
    elementIds.forEach((id) => Code.expect(doc.getElementById(id)).to.exist())
  }

  static checkElementsDoNotExist (doc, elementIds) {
    elementIds.forEach((id) => Code.expect(doc.getElementById(id)).to.not.exist())
  }

  static checkValidationMessage (doc, fieldId, expectedErrorMessage, shouldHaveErrorClass) {
    // Panel summary error item
    Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

    // Relevant field error
    if (shouldHaveErrorClass) {
      Code.expect(doc.getElementById(`${fieldId}`).getAttribute('class')).contains('form-control-error')
    }
    Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
  }

  static async getDoc (request, status = 200) {
    // TODO Possibly call this executeRequest
    // This executes a request and then returns the document view
    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(status)

    const parser = new DOMParser()
    return parser.parseFromString(res.payload, 'text/html')
  }

  static stubGetCookies (sandbox, CookieService, cookies) {
    // Save for use in stub
    const cookieGet = CookieService.get

    sandbox.stub(CookieService, 'get').value((request, cookieKey) => {
      // Only stub the get for cookies we are stubbing
      if (Object.keys(cookies).includes(cookieKey)) {
        return cookies[cookieKey]()
      }
      return cookieGet(request, cookieKey)
    })
  }

  test (options = {
    excludeCookieGetTests: false,
    excludeCookiePostTests: false,
    excludeAlreadySubmittedTest: false}) {
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
      if (!options.excludeCookieGetTests) {
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

      if (!options.excludeCookiePostTests) {
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

      if (!options.excludeAlreadySubmittedTest) {
        lab.test('Redirects to the Already Submitted screen if the application has already been submitted and paid for', async () => {
          Application.prototype.isSubmitted = () => true
          Payment.prototype.isPaid = () => true

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(alreadySubmittedRoutePath)
        })

        lab.test('Redirects to the Not Paid screen if the application has been submitted but not paid for', async () => {
          Application.prototype.isSubmitted = () => true
          Payment.prototype.isPaid = () => false

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(notPaidRoutePath)
        })
      }

      lab.test(`GET ${routePath} page should have the beta banner`, async () => {
        const res = await server.inject(getRequest)

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.payload, 'text/html')

        let element = doc.getElementById('beta-banner')
        Code.expect(element).to.exist()

        element = doc.getElementById('beta-banner-give-feedback-link')
        Code.expect(element).to.exist()
      })

      lab.test(`GET ${routePath} page should have the privacy footer link`, async () => {
        const res = await server.inject(getRequest)

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.payload, 'text/html')

        const element = doc.getElementById('footer-privacy-link')
        Code.expect(element).to.exist()
        Code.expect(element.getAttribute('href')).to.equal('/information/privacy')
      })
    })
  }
}
