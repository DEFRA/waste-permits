'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const CompanyLookupService = require('../../src/services/companyLookup.service')
const Account = require('../../src/models/account.model')
const LoggingService = require('../../src/services/logging.service')

const {COOKIE_RESULT} = require('../../src/constants')
const COMPANY_STATUSES = {
  DISSOLVED: 'has been dissolved',
  LIQUIDATION: 'has gone into liquidation',
  RECEIVERSHIP: 'is in receivership',
  ADMINISTRATION: 'is in administration',
  VOLUNTARY_ARRANGEMENT: 'is insolvent and has a Company Voluntary Arrangement',
  CONVERTED_CLOSED: 'has been closed or converted',
  INSOLVENCY_PROCEEDINGS: 'is insolvent',
  NOT_ACTIVE: `isn't active`
}

let validateCookieStub
let companyLookupGetCompanyStub
let getByApplicationIdStub
let logErrorStub
let fakeAccount
let fakeCompany

const routePath = '/permit-holder/company/status-not-active'
const nextRoutePath = '/permit-holder/company/check-name'

lab.beforeEach(() => {
  fakeAccount = {
    id: 'ACCOUNT_ID',
    companyNumber: '01234567'
  }

  fakeCompany = {
    name: 'THE COMPANY NAME',
    address: 'THE COMPANY ADDRESS',
    status: 'NOT_ACTIVE',
    isActive: false
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  companyLookupGetCompanyStub = CompanyLookupService.getCompany
  CompanyLookupService.getCompany = () => fakeCompany

  getByApplicationIdStub = Account.getByApplicationId
  Account.getByApplicationId = () => undefined
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  CompanyLookupService.getCompany = companyLookupGetCompanyStub
  Account.getByApplicationId = getByApplicationIdStub
})

lab.experiment('Check company status page tests:', () => {
  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    const getDoc = async () => {
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      doc = parser.parseFromString(res.payload, 'text/html')
      return doc
    }

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }

      Account.getByApplicationId = () => Promise.resolve(new Account(fakeAccount))

      Account.prototype.save = () => new Account(fakeAccount)
    })

    lab.experiment('success', () => {
      lab.test('should have a back link', async () => {
        const doc = await getDoc()
        const element = doc.getElementById('back-link')
        Code.expect(element).to.exist()
      })

      lab.experiment('for company with a status of', () => {
        Object.keys(COMPANY_STATUSES).forEach((status) => {
          lab.test(`${status}`, async () => {
            fakeCompany.status = status
            fakeCompany.isActive = (status === 'ACTIVE')
            const doc = await getDoc()
            Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`We can't issue a permit to that company because it ${COMPANY_STATUSES[status]}`)
            Code.expect(doc.getElementById('company-status-message')).to.exist()
            Code.expect(doc.getElementById('company-name').firstChild.nodeValue).to.equal(fakeCompany.name)
            Code.expect(doc.getElementById('company-number').firstChild.nodeValue).to.equal(fakeAccount.companyNumber)
          })
        })
      })

      lab.test('for company with a status of ACTIVE', async () => {
        fakeCompany.status = 'ACTIVE'
        fakeCompany.isActive = true
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('for a company that does not exist', async () => {
        fakeCompany = {}
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to timeout screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => COOKIE_RESULT.COOKIE_EXPIRED

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/errors/timeout')
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
})
