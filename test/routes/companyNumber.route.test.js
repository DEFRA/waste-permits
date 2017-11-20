'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/models/application.model')
const Account = require('../../src/models/account.model')
const LoggingService = require('../../src/services/logging.service')

let validateCookieStub
let accountSaveStub
let getByApplicationIdStub
let applicationGetByIdStub
let logErrorStub
let fakeAccount
let fakeApplication

const routePath = '/permit-holder/company/number'
const nextRoutePath = '/permit-holder/company/check-name'

lab.beforeEach(() => {
  fakeAccount = {
    id: '403710b7-18b8-e711-810d-5065f38bb461',
    companyNumber: '01234567'
  }
  fakeApplication = {
    accountId: fakeAccount.id
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  getByApplicationIdStub = Account.getByApplicationId
  Account.getByApplicationId = () => undefined

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplication)
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  Account.getByApplicationId = getByApplicationIdStub
  Application.getById = applicationGetByIdStub
})

lab.experiment('Get company number page tests:', () => {
  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    const getDoc = async () => {
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      doc = parser.parseFromString(res.payload, 'text/html')
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`What's the UK company registration number?`)
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

      Account.getByApplicationId = (authToken, applicationId) => Promise.resolve(new Account(fakeAccount))

      accountSaveStub = Account.prototype.save
      Account.prototype.save = (authToken) => new Account(fakeAccount)
    })

    lab.test('should have a back link', async () => {
      const doc = await getDoc()
      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })

    lab.test('success', async () => {
      doc = await getDoc()

      Code.expect(doc.getElementById('company-number-label')).to.exist()
      Code.expect(doc.getElementById('company-number').getAttribute('value')).to.equal(fakeAccount.companyNumber)
      Code.expect(doc.getElementById('overseas-help')).to.exist()
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
        Account.getByApplicationId = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {'company-number': fakeAccount.companyNumber}
      }

      accountSaveStub = Account.prototype.save
      Account.prototype.save = () => {
        return fakeAccount.id
      }
    })

    lab.afterEach(() => {
      // Restore stubbed methods
      Account.prototype.save = accountSaveStub
    })

    lab.experiment('success', () => {
      lab.test('when account is saved', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when account is updated', async () => {
        Account.getByApplicationId = (authToken, applicationId) => Promise.resolve(new Account(fakeAccount))
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      const checkValidationError = async (companyNumber, expectedErrorMessage) => {
        postRequest.payload['company-number'] = companyNumber
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(200)

        const parser = new DOMParser()
        const doc = parser.parseFromString(res.payload, 'text/html')

        // Panel summary error item
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Company number field error
        Code.expect(doc.getElementById('company-number-error').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Company number field contains payload
        Code.expect(doc.getElementById('company-number').getAttribute('value')).to.equal(companyNumber)
      }

      lab.test('when company number is empty', async () => {
        checkValidationError('', 'Enter a company registration number')
      })

      lab.test('when company number is not the right length', async () => {
        checkValidationError('01234', 'Enter a valid company registration number with either 8 digits or 2 letters and 6 digits')
      })

      lab.test('when company number contains invalid characters', async () => {
        checkValidationError('########', 'Enter a valid company registration number with either 8 digits or 2 letters and 6 digits')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => undefined

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Account.getByApplicationId = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Account.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  })
})
