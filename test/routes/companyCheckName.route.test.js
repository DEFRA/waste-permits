'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const CompanyLookupService = require('../../src/services/companyLookup.service')

const Application = require('../../src/models/application.model')
const ApplicationLine = require('../../src/models/applicationLine.model')
const Account = require('../../src/models/account.model')
const {COOKIE_RESULT} = require('../../src/constants')

let validateCookieStub
let companyLookupGetCompanyStub
let applicationGetByIdStub
let applicationLineGetByIdStub
let accountConfirmStub
let accountSaveStub
let applicationSaveStub

const routePath = '/permit-holder/company/check-name'
const nextRoutePath = '/permit-holder/company/director-date-of-birth'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const fakeApplicationData = {
  accountId: 'ACCOUNT_ID',
  tradingName: 'THE TRADING NAME'
}

const fakeCompanyData = {
  name: 'THE COMPANY NAME',
  address: 'THE COMPANY ADDRESS',
  status: 'ACTIVE',
  IsActive: true
}

const fakeAccountData = {
  companyNumber: fakeCompanyData.companyNumber,
  accountName: fakeCompanyData.name
}

lab.beforeEach(() => {
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  companyLookupGetCompanyStub = CompanyLookupService.getCompany
  CompanyLookupService.getCompany = () => fakeCompanyData

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplicationData)

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = () => new ApplicationLine()

  applicationGetByIdStub = Account.getByApplicationId
  Account.getByApplicationId = () => new Account(fakeAccountData)

  accountConfirmStub = Account.prototype.confirm
  Account.prototype.confirm = () => {}

  accountSaveStub = Account.prototype.save
  Account.prototype.save = () => {}

  applicationSaveStub = Application.prototype.save
  Application.prototype.save = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  CompanyLookupService.getCompany = companyLookupGetCompanyStub
  Application.getById = applicationGetByIdStub
  ApplicationLine.getById = applicationLineGetByIdStub
  Account.getByApplicationId = applicationGetByIdStub
  Account.prototype.confirm = accountConfirmStub
  Account.prototype.save = accountSaveStub
  Application.prototype.save = applicationSaveStub
})

const checkPageElements = async (request, companyFound, expectedValue) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element

  if (companyFound) {
    // Company found page elements
    element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(`Is this the right company?`)

    const elementIds = [
      'back-link',
      'defra-csrf-token',
      'company-number-label',
      'enter-different-number-company-exists-link',
      'company-name',
      'company-address',
      'not-the-registered-office-details',
      'not-the-registered-office-panel',
      'not-the-registered-office-link',
      'trading-name-visually-hidden',
      'use-business-trading-name',
      'use-business-trading-name-label',
      'give-business-trading-name',
      'business-trading-name-label',
      'business-trading-name'
    ]
    for (let id of elementIds) {
      element = doc.getElementById(id)
      Code.expect(doc.getElementById(id)).to.exist()
    }

    element = doc.getElementById('company-name').firstChild
    Code.expect(element.nodeValue).to.equal(fakeAccountData.accountName)

    element = doc.getElementById('company-address').firstChild
    Code.expect(element.nodeValue).to.equal(fakeCompanyData.address)

    element = doc.getElementById('business-trading-name')
    Code.expect(element.getAttribute('value')).to.equal(expectedValue)

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  } else {
    // Company not found page elements
    element = doc.getElementById('page-heading-company-not-found').firstChild
    Code.expect(element.nodeValue).to.equal(`We can't find that company`)

    const elementIds = [
      'search-term-text',
      'enter-different-number-link'
    ]

    for (let id of elementIds) {
      element = doc.getElementById(id).firstChild
      Code.expect(element).to.exist()
    }
  }
}

const checkValidationError = async (expectedErrorMessage) => {
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element

  // Panel summary error item
  element = doc.getElementById('error-summary-list-item-0').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

  // Location site name field error
  Code.expect(doc.getElementById('business-trading-name').getAttribute('class')).contains('form-control-error')
  element = doc.getElementById('business-trading-name-error').firstChild.firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Check Company Details page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`GET ${routePath} page tests`, () => {
    lab.test('Check page elements - no existing trading name saved', async () => {
      Application.getById = () => new Application({
        accountId: fakeAccountData.address,
        tradingName: undefined
      })
      checkPageElements(getRequest, true, '')
    })

    lab.test('Check page elements - Company Details not found at Companies House', async () => {
      // Stub the company name not found response
      CompanyLookupService.getCompany = () => undefined
      checkPageElements(getRequest, false)
    })

    lab.test('Check page elements - existing trading name loaded', async () => {
      checkPageElements(getRequest, true, fakeApplicationData.tradingName)
    })
  })

  lab.experiment(`POST ${routePath} page tests`, () => {
    lab.experiment('Success', () => {
      lab.test('Checkbox ticked and trading name entered - redirects to the next route', async () => {
        postRequest.payload['use-business-trading-name'] = 'on'
        postRequest.payload['business-trading-name'] = fakeApplicationData.tradingName

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('Checkbox not ticked and no trading name entered - redirects to the next route', async () => {
        postRequest.payload['use-business-trading-name'] = ''
        postRequest.payload['business-trading-name'] = ''

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('Account is confirmed', async () => {
        postRequest.payload['use-business-trading-name'] = ''
        postRequest.payload['business-trading-name'] = ''

        const spy = sinon.spy(Account.prototype, 'confirm')
        await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
      })
    })

    lab.experiment('Failure', () => {
      lab.test('Checkbox ticked and no trading name entered - shows an error', async () => {
        postRequest.payload['use-business-trading-name'] = 'on'
        postRequest.payload['business-trading-name'] = ''
        await checkValidationError('Enter a business trading name')
      })

      lab.test('Trading name too long - shows an error', async () => {
        postRequest.payload['use-business-trading-name'] = 'on'
        postRequest.payload['business-trading-name'] = 'A very long trading name xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx xxxxxxxxxx'
        await checkValidationError('Enter a shorter trading name with no more than 170 characters')
      })
    })
  })
})
