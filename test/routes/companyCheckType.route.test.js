'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const CompanyLookupService = require('../../src/services/companyLookup.service')
const Application = require('../../src/persistence/entities/application.entity')
const Account = require('../../src/persistence/entities/account.entity')
const RecoveryService = require('../../src/services/recovery.service')
const LoggingService = require('../../src/services/logging.service')

const { COOKIE_RESULT } = require('../../src/constants')
const COMPANY_TYPES = {
  UK_ESTABLISHMENT: 'a UK establishment company'
}

const VALID_TYPE = 'valid type'

const routePath = '/permit-holder/company/wrong-type'
const nextRoutePath = '/permit-holder/company/status-not-active'
const errorPath = '/errors/technical-problem'

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(CompanyLookupService, 'getCompany').value(() => mocks.companyData)
  sandbox.stub(CompanyLookupService, 'getActiveDirectors').value(() => [{}])
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Account.prototype, 'save').value(() => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Check company type page tests:', () => {
  // There is no POST for this route
  new GeneralTestHelper({ lab, routePath }).test({
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

      lab.test('for company with a valid type', async () => {
        mocks.companyData.type = VALID_TYPE
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.experiment('for company with a type of', () => {
        Object.keys(COMPANY_TYPES).forEach((type) => {
          lab.test(`${type}`, async () => {
            mocks.companyData.type = type
            const doc = await GeneralTestHelper.getDoc(getRequest)
            Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`That company cannot apply because it is ${COMPANY_TYPES[type]}`)
            Code.expect(doc.getElementById('company-type-message')).to.exist()
            Code.expect(doc.getElementById('company-name').firstChild.nodeValue).to.equal(mocks.companyData.name)
            Code.expect(doc.getElementById('company-type').firstChild.nodeValue).to.equal(COMPANY_TYPES[type])
            Code.expect(doc.getElementById('company-number').firstChild.nodeValue).to.equal(mocks.account.companyNumber)
          })
        })
      })

      lab.test('for a company that does not exist', async () => {
        sinon.stub(CompanyLookupService, 'getCompany').value(() => undefined)
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
