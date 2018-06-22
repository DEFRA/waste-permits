'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const CompanyLookupService = require('../../src/services/companyLookup.service')
const Account = require('../../src/models/account.model')
const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
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
  NOT_ACTIVE: `is not active`
}

let sandbox

let fakeApplication
let fakeAccount
let fakeCompany

const routes = {
  'Limited Company': {
    pageHeading: 'We cannot issue a permit to that company because it',
    routePath: '/permit-holder/company/status-not-active',
    nextPath: '/permit-holder/company/check-name',
    errorPath: '/errors/technical-problem',
    requiredOfficers: 'directors'
  },
  'Limited Liability Partnership': {
    pageHeading: 'We cannot issue a permit to that limited liability partnership (LLP) because it',
    routePath: '/permit-holder/limited-liability-partnership/status-not-active',
    nextPath: '/permit-holder/limited-liability-partnership/check-name',
    errorPath: '/errors/technical-problem',
    requiredOfficers: 'designated members'
  }
}

Object.entries(routes).forEach(([companyType, {pageHeading, routePath, nextPath, errorPath, requiredOfficers}]) => {
  lab.experiment(companyType, () => {
    lab.beforeEach(() => {
      fakeApplication = {
        id: 'APPLICATION_ID',
        applicationName: 'APPLICATION_NAME'
      }

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

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()

      // Stub methods
      sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
      sandbox.stub(CompanyLookupService, 'getCompany').value(() => fakeCompany)
      sandbox.stub(CompanyLookupService, 'getActiveOfficers').value(() => [{}])
      sandbox.stub(Account, 'getByApplicationId').value(() => fakeAccount)
      sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(Account.prototype, 'save').value(() => fakeAccount)
      sandbox.stub(Payment, 'getBacsPayment').value(() => {})
      sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    lab.experiment('Company status page tests:', () => {
      // There is no POST for this route
      new GeneralTestHelper(lab, routePath).test({
        excludeCookiePostTests: true
      })

      lab.experiment(`GET ${routePath}`, () => {
        let getRequest

        lab.beforeEach(() => {
          getRequest = {
            method: 'GET',
            url: routePath,
            headers: {},
            payload: {}
          }
        })

        lab.experiment('success', () => {
          lab.test('should have a back link', async () => {
            const doc = await GeneralTestHelper.getDoc(getRequest)
            const element = doc.getElementById('back-link')
            Code.expect(element).to.exist()
          })

          lab.experiment('for company with a status of', () => {
            Object.keys(COMPANY_STATUSES).forEach((status) => {
              lab.test(`${status}`, async () => {
                fakeCompany.status = status
                fakeCompany.isActive = (status === 'ACTIVE')
                const doc = await GeneralTestHelper.getDoc(getRequest)
                Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`${pageHeading} ${COMPANY_STATUSES[status]}`)
                Code.expect(doc.getElementById('company-status-message')).to.exist()
                Code.expect(doc.getElementById('company-name').firstChild.nodeValue).to.equal(fakeCompany.name)
                Code.expect(doc.getElementById('company-number').firstChild.nodeValue).to.equal(fakeAccount.companyNumber)
              })
            })
          })

          lab.experiment('for company with', () => {
            lab.test(`no ${requiredOfficers}`, async () => {
              CompanyLookupService.getActiveOfficers = () => []
              fakeCompany.isActive = true
              const doc = await GeneralTestHelper.getDoc(getRequest)
              Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`${pageHeading} has no ${requiredOfficers}`)
              Code.expect(doc.getElementById('company-status-message')).to.exist()
              Code.expect(doc.getElementById('company-name').firstChild.nodeValue).to.equal(fakeCompany.name)
              Code.expect(doc.getElementById('company-number').firstChild.nodeValue).to.equal(fakeAccount.companyNumber)
            })
          })

          lab.test('for company with a status of ACTIVE', async () => {
            fakeCompany.status = 'ACTIVE'
            fakeCompany.isActive = true
            const res = await server.inject(getRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(nextPath)
          })

          lab.test('for a company that does not exist', async () => {
            fakeCompany = {}
            const res = await server.inject(getRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(nextPath)
          })
        })

        lab.experiment('failure', () => {
          lab.test('redirects to error screen when failing to get the application ID', async () => {
            const spy = sandbox.spy(LoggingService, 'logError')
            Account.getByApplicationId = () => {
              throw new Error('read failed')
            }

            const res = await server.inject(getRequest)
            Code.expect(spy.callCount).to.equal(1)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(errorPath)
          })
        })
      })
    })
  })
})
