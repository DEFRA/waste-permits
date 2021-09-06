'use strict'

const Code = require('@hapi/code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../server')

const Application = require('../../src/persistence/entities/application.entity')
const TaskList = require('../../src/models/taskList/base.taskList')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const cookieTimeoutPath = '/errors/timeout'
const startAtBeginningRoutePath = '/errors/order/start-at-beginning'
const applicationReceivedRoutePath = '/done'
const incompleteTaskListRoutePath = '/task-list?showError=true'

let getRequest, postRequest

module.exports = class GeneralTestHelper {
  constructor ({ lab, routePath }) {
    this.lab = lab
    this.routePath = routePath
  }

  static checkElementsExist (doc, elementIds) {
    elementIds.forEach((id) => Code.expect(doc.getElementById(id)).to.exist())
  }

  static checkElementsDoNotExist (doc, elementIds) {
    elementIds.forEach((id) => Code.expect(doc.getElementById(id)).to.not.exist())
  }

  static checkValidationMessage (doc, fieldId, expectedErrorMessage, shouldHaveErrorClass = false, fieldIndex = 0) {
    // Panel summary error item
    Code.expect(doc.getElementById(`error-summary-list-item-${fieldIndex}`).firstChild.nodeValue).to.equal(expectedErrorMessage)

    // Relevant field error
    if (shouldHaveErrorClass) {
      Code.expect(doc.getElementById(`${fieldId}`).getAttribute('class')).contains('form-control-error')
    }
    Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
  }

  static checkNoValidationMessage (doc, fieldId) {
    Code.expect(doc.getElementById(`${fieldId}-error`)).to.not.exist()
  }

  static checkValidationMessageCount (doc, expectedCount) {
    Code.expect(doc.getElementById('error-summary-list').getElementsByTagName('li').length).to.equal(expectedCount)
  }

  static async getDoc (request, status = 200) {
    // TODO Possibly call this executeRequest
    // This executes a request and then returns the document view
    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(status)

    const parser = new DOMParser()
    return parser.parseFromString(res.payload, 'text/html')
  }

  static getText (element) {
    let text = ''
    for (let index = 0; index < element.childNodes.length; index++) {
      const node = element.childNodes[index]
      text += node.nodeValue ? node.nodeValue : this.getText(node)
    }
    return text
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

  test (options) {
    options = Object.assign({
      excludeCookieGetTests: false,
      excludeCookiePostTests: false,
      excludeAlreadySubmittedTest: false,
      includeTasksNotCompleteTest: false
    }, options)
    const { lab, routePath } = this

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
          Code.expect(res.headers.location).to.equal(startAtBeginningRoutePath)
        })

        lab.test(`GET ${routePath} redirects to timeout screen when the cookie has expired`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_EXPIRED

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(cookieTimeoutPath)
        })
      }

      if (!options.excludeCookiePostTests) {
        lab.test(`POST ${routePath} redirects to timeout screen when the cookie is not found`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_NOT_FOUND

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(startAtBeginningRoutePath)
        })

        lab.test(`POST ${routePath} redirects to timeout screen when the cookie has expired`, async () => {
          CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_EXPIRED

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.equal(cookieTimeoutPath)
        })
      }

      if (!options.excludeAlreadySubmittedTest) {
        lab.test('Redirects to the Application received page', async () => {
          Application.prototype.isSubmitted = () => true

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.contains(applicationReceivedRoutePath)
        })
      }

      if (options.includeTasksNotCompleteTest) {
        lab.test('Redirects to the Task list page with an error', async () => {
          TaskList.isComplete = () => false

          const res = await server.inject(getRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers.location).to.contains(incompleteTaskListRoutePath)
        })
      }

      if (!options.excludeHtmlTests) {
        lab.test(`GET ${routePath} page should have the beta banner`, async () => {
          const res = await server.inject(getRequest)

          const parser = new DOMParser()
          const doc = parser.parseFromString(res.payload, 'text/html')

          let element = doc.getElementById('beta-banner')
          Code.expect(element).to.exist()

          element = doc.getElementById('beta-banner-give-feedback-link')
          Code.expect(element).to.exist()
        })

        lab.test(`GET ${routePath} page should have the tabindex set on the main content`, async () => {
          const res = await server.inject(getRequest)

          const parser = new DOMParser()
          const doc = parser.parseFromString(res.payload, 'text/html')

          const element = doc.getElementById('content')
          Code.expect(element.getAttribute('tabindex')).to.equal('-1')
        })

        lab.test(`GET ${routePath} page should have the privacy footer link`, async () => {
          const res = await server.inject(getRequest)

          const parser = new DOMParser()
          const doc = parser.parseFromString(res.payload, 'text/html')

          const element = doc.getElementById('footer-privacy-link')
          Code.expect(element).to.exist()
          Code.expect(element.getAttribute('href')).to.equal('https://www.gov.uk/guidance/environmental-permits-privacy-notice')
        })
      }
    })
  }
}
