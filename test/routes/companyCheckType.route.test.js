'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const CompanyLookupService = require('../../src/services/companyLookup.service')
const Application = require('../../src/models/application.model')
const Account = require('../../src/models/account.model')
const Payment = require('../../src/models/payment.model')
const LoggingService = require('../../src/services/logging.service')

const {COOKIE_RESULT} = require('../../src/constants')
const COMPANY_TYPES = {
  UK_ESTABLISHMENT: 'a UK establishment company'
}

const VALID_TYPE = 'valid type'

let sandbox

let fakeApplication
let fakeAccount
let fakeCompany

const routePath = '/permit-holder/company/wrong-type'
const nextRoutePath = '/permit-holder/company/status-not-active'
const errorPath = '/errors/technical-problem'

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
    type: 'UK_ESTABLISHMENT'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(CompanyLookupService, 'getCompany').value(() => fakeCompany)
  sandbox.stub(CompanyLookupService, 'getActiveDirectors').value(() => [{}])
  sandbox.stub(Account, 'getByApplicationId').value(() => fakeAccount)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Payment, 'getBacsPayment').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Check company type page tests:', () => {
  // There is no POST for this route
  new GeneralTestHelper(lab, routePath).test({
    excludeCookiePostTests: true})

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

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
        const doc = await GeneralTestHelper.getDoc(getRequest)
        const element = doc.getElementById('back-link')
        Code.expect(element).to.exist()
      })

      lab.test('for company with a valid type', async () => {
        fakeCompany.type = VALID_TYPE
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.experiment('for company with a type of', () => {
        Object.keys(COMPANY_TYPES).forEach((type) => {
          lab.test(`${type}`, async () => {
            fakeCompany.type = type
            const doc = await GeneralTestHelper.getDoc(getRequest)
            Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`That company cannot apply because it is ${COMPANY_TYPES[type]}`)
            Code.expect(doc.getElementById('company-type-message')).to.exist()
            Code.expect(doc.getElementById('company-name').firstChild.nodeValue).to.equal(fakeCompany.name)
            Code.expect(doc.getElementById('company-type').firstChild.nodeValue).to.equal(COMPANY_TYPES[type])
            Code.expect(doc.getElementById('company-number').firstChild.nodeValue).to.equal(fakeAccount.companyNumber)
          })
        })
      })

      lab.test('for a company that does not exist', async () => {
        fakeCompany = {}
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
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
