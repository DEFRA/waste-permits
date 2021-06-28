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
const ApplicationLine = require('../../src/persistence/entities/applicationLine.entity')
const Account = require('../../src/persistence/entities/account.entity')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

let postRequest
let getRequest

const routes = {
  'Limited Company': {
    pageHeading: 'Is this the right company?',
    routePath: '/permit-holder/company/check-name',
    nextPath: '/permit-holder/company/director-date-of-birth'
  },
  'Limited Liability Partnership': {
    pageHeading: 'Is this the right limited liability partnership?',
    routePath: '/permit-holder/limited-liability-partnership/check-name',
    nextPath: '/permit-holder/limited-liability-partnership/member-date-of-birth'
  }
}

Object.entries(routes).forEach(([companyType, { pageHeading, routePath, nextPath }]) => {
  lab.experiment(companyType, () => {
    let mocks
    let sandbox

    lab.beforeEach(() => {
      mocks = new Mocks()

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

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()

      // Stub methods
      sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
      sandbox.stub(CompanyLookupService, 'getCompany').value(() => mocks.companyData)
      sandbox.stub(Application, 'getById').value(() => mocks.application)
      sandbox.stub(ApplicationLine, 'getById').value(() => mocks.applicationLine)
      sandbox.stub(Account, 'getByApplicationId').value(() => mocks.account)
      sandbox.stub(Account.prototype, 'confirm').value(() => undefined)
      sandbox.stub(Account.prototype, 'save').value(() => undefined)
      sandbox.stub(Application.prototype, 'save').value(() => undefined)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    const checkPageElements = async (request, companyFound, expectedValue) => {
      const doc = await GeneralTestHelper.getDoc(request)
      let element

      if (companyFound) {
        // Company found page elements
        element = doc.getElementById('page-heading').firstChild
        Code.expect(element.nodeValue).to.equal(pageHeading)

        // Test for the existence of expected static content
        GeneralTestHelper.checkElementsExist(doc, [
          'back-link',
          'defra-csrf-token',
          'company-number-label',
          'enter-different-number-company-exists-link',
          'company-name',
          'company-address',
          'check-company-address',
          'not-the-registered-office-details',
          'not-the-registered-office-panel',
          'not-the-registered-office-link',
          'trading-name-visually-hidden',
          'use-business-trading-name',
          'use-business-trading-name-label',
          'give-business-trading-name',
          'business-trading-name-label',
          'business-trading-name'
        ])

        element = doc.getElementById('company-name').firstChild
        Code.expect(element.nodeValue).to.equal(mocks.account.accountName)

        element = doc.getElementById('company-address').firstChild
        Code.expect(element.nodeValue).to.equal(mocks.companyData.address)

        element = doc.getElementById('business-trading-name')
        Code.expect(element.getAttribute('value')).to.equal(expectedValue)

        element = doc.getElementById('submit-button').firstChild
        Code.expect(element.nodeValue).to.equal('Continue')
      } else {
        // Company not found page elements
        element = doc.getElementById('page-heading-company-not-found').firstChild
        Code.expect(element.nodeValue).to.equal('We cannot find that company')

        // Test for the existence of expected static content
        GeneralTestHelper.checkElementsExist(doc, [
          'search-term-text',
          'enter-different-number-link'
        ])
      }
    }

    const checkValidationError = async (expectedErrorMessage) => {
      const doc = await GeneralTestHelper.getDoc(postRequest)
      let element

      // Panel summary error item
      element = doc.getElementById('error-summary-list-item-0').firstChild
      Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

      // Location site name field error
      Code.expect(doc.getElementById('business-trading-name').getAttribute('class')).contains('form-control-error')
      element = doc.getElementById('business-trading-name-error').firstChild.firstChild
      Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
    }

    lab.experiment('Company name page tests:', () => {
      new GeneralTestHelper({ lab, routePath }).test()

      lab.experiment(`GET ${routePath} page tests`, () => {
        lab.test('Check page elements - no existing trading name saved', async () => {
          delete mocks.application.tradingName
          checkPageElements(getRequest, true, '')
        })

        lab.test('Check page elements - Company Details not found at Companies House', async () => {
          // Stub the company name not found response
          CompanyLookupService.getCompany = () => undefined
          checkPageElements(getRequest, false)
        })

        lab.test('Check page elements - existing trading name loaded', async () => {
          checkPageElements(getRequest, true, mocks.application.tradingName)
        })
      })

      lab.experiment(`POST ${routePath} page tests`, () => {
        lab.experiment('Success', () => {
          lab.test('Checkbox ticked and trading name entered - redirects to the next route', async () => {
            postRequest.payload['use-business-trading-name'] = 'on'
            postRequest.payload['business-trading-name'] = mocks.application.tradingName

            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers.location).to.equal(nextPath)
          })

          lab.test('Checkbox not ticked and no trading name entered - redirects to the next route', async () => {
            postRequest.payload['use-business-trading-name'] = ''
            postRequest.payload['business-trading-name'] = ''

            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers.location).to.equal(nextPath)
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
  })
})
