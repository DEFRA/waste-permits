'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('../../generalTestHelper.test')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const Application = require('../../../../src/models/application.model')
const Confidentiality = require('../../../../src/models/taskList/confidentiality.model')
const LoggingService = require('../../../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../../../src/constants')

let validateCookieStub
let applicationGetByIdStub
let applicationIsSubmittedStub
let applicationSaveStub
let confidentialityUpdateCompletenessStub
let getByIdStub
let logErrorStub
let fakeApplication

const routePath = '/confidentiality'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    confidentialityDetails: 'CONFIDENTIALITY DETAILS',
    confidentiality: true
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplication)

  applicationIsSubmittedStub = Application.prototype.isSubmitted
  Application.prototype.isSubmitted = () => false

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  getByIdStub = Application.getById
  Application.getById = () => Promise.resolve(new Application(fakeApplication))
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Application.getById = applicationGetByIdStub
  Application.prototype.isSubmitted = applicationIsSubmittedStub
  LoggingService.logError = logErrorStub
  Application.getById = getByIdStub
})

lab.experiment('Is part of your application commercially confidential? page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    const getDoc = async () => {
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      doc = parser.parseFromString(res.payload, 'text/html')
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Is part of your application commercially confidential?')
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

      Code.expect(doc.getElementById('declaration-details').firstChild.nodeValue).to.equal(fakeApplication.confidentialityDetails)
      Code.expect(doc.getElementById('confidentiality-hint')).to.exist()
      Code.expect(doc.getElementById('declaration-notice')).to.not.exist()
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
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
          'declared': fakeApplication.confidentiality,
          'declaration-details': fakeApplication.confidentialityDetails
        }
      }

      // Stub methods
      applicationSaveStub = Application.prototype.save
      Application.prototype.save = () => {}

      confidentialityUpdateCompletenessStub = Confidentiality.updateCompleteness
      Confidentiality.updateCompleteness = () => {}
    })

    lab.afterEach(() => {
      // Restore stubbed methods
      Application.prototype.save = applicationSaveStub
      Confidentiality.updateCompleteness = confidentialityUpdateCompletenessStub
    })

    lab.experiment('success', () => {
      lab.test('when application is saved', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      const checkValidationMessage = async (fieldId, expectedErrorMessage, shouldHaveErrorClass) => {
        const doc = await getDoc()
        // Panel summary error item
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Relevant confidentiality details field error
        if (shouldHaveErrorClass) {
          Code.expect(doc.getElementById(`${fieldId}`).getAttribute('class')).contains('form-control-error')
        }
        Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
      }

      lab.test('when confidentiality not checked', async () => {
        postRequest.payload = {}
        await checkValidationMessage('declared', `Select yes if you want to claim confidentiality or no if you don't`)
      })

      lab.test('when confidentiality set to yes and no details entered', async () => {
        postRequest.payload = {'declared': 'yes'}
        await checkValidationMessage('declaration-details', 'Explain what information is confidential and why', true)
      })

      lab.test('when confidentiality set to yes and details entered with 2001 characters', async () => {
        postRequest.payload = {'declared': 'yes', 'declaration-details': 'a'.repeat(2001)}
        await checkValidationMessage('declaration-details', 'You can only enter 2,000 characters - please shorten what you’ve written', true)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
