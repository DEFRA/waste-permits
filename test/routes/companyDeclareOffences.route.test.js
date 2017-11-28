'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/models/application.model')
const LoggingService = require('../../src/services/logging.service')

let validateCookieStub
let applicationSaveStub
let getByIdStub
let logErrorStub
let fakeApplication

const routePath = '/permit-holder/company/declare-offences'
const nextRoutePath = '/permit-holder/company/bankruptcy-insolvency'

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    relevantOffencesDetails: 'RELEVANT OFFENCES DETAILS',
    relevantOffences: 'yes'
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  getByIdStub = Application.getById
  Application.getById = () => Promise.resolve(new Application(fakeApplication))
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  Application.getById = getByIdStub
})

lab.experiment('Company Declare Offences tests:', () => {
  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    const getDoc = async () => {
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      doc = parser.parseFromString(res.payload, 'text/html')
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Does anyone connected with your business have a conviction for a relevant offence?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
      return doc
    }

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('should have a back link', async () => {
      const doc = await getDoc()
      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })

    lab.test('success', async () => {
      doc = await getDoc()

      Code.expect(doc.getElementById('declaration-details').firstChild.nodeValue).to.equal(fakeApplication.relevantOffencesDetails)
      Code.expect(doc.getElementById('declaration-hint')).to.exist()
      Code.expect(doc.getElementById('declaration-notice')).to.not.exist()
      Code.expect(doc.getElementById('operator-type-is-limited-company')).to.exist()
      Code.expect(doc.getElementById('operator-type-is-individual')).to.not.exist()
      Code.expect(doc.getElementById('operator-type-is-partnership')).to.not.exist()
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => undefined

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    const getDoc = async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      return parser.parseFromString(res.payload, 'text/html')
    }

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'declared': fakeApplication.relevantOffences,
          'declaration-details': fakeApplication.relevantOffencesDetails
        }
      }

      applicationSaveStub = Application.prototype.save
      Application.prototype.save = () => {}
    })

    lab.afterEach(() => {
      // Restore stubbed methods
      Application.prototype.save = applicationSaveStub
    })

    lab.experiment('success', () => {
      lab.test('when application is saved', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      const checkValidationMessage = async (fieldId, expectedErrorMessage) => {
        const doc = await getDoc()
        // Panel summary error item
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Relevant offences details field error
        Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.nodeValue).to.equal(expectedErrorMessage)
      }

      lab.test('when offences not checked', async () => {
        postRequest.payload = {}
        await checkValidationMessage('declared', `Select yes if you have convictions to declare or no if you don't`)
      })

      lab.test('when offences set to yes and no details entered', async () => {
        postRequest.payload = {'declared': 'yes'}
        await checkValidationMessage('declaration-details', 'Enter details of the convictions')
      })

      lab.test('when offences set to yes and no details entered', async () => {
        postRequest.payload = {'declared': 'yes', 'declaration-details': 'a'.repeat(2001)}
        await checkValidationMessage('declaration-details', 'You can only enter 2,000 characters - please shorten what you’ve written')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => undefined

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when failing to get the application', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  })
})
