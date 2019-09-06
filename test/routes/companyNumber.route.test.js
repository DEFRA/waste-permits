'use strict'

const Code = require('@hapi/code')
const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/persistence/entities/application.entity')
const Account = require('../../src/persistence/entities/account.entity')
const RecoveryService = require('../../src/services/recovery.service')
const LoggingService = require('../../src/services/logging.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routes = {
  'Limited Company': {
    pageHeading: 'What is the UK company registration number?',
    routePath: '/permit-holder/company/number',
    nextPath: '/permit-holder/company/wrong-type',
    validCompanyNumber: '01234567',
    invalidCompanyNumberMessage: 'Enter a valid company registration number with either 8 digits or 2 letters and 6 digits'
  },
  'Limited Company (Charity)': {
    charityPermitHolder: 'CHARITY_PERMIT_HOLDER',
    pageHeading: `What is the company or Charitable Incorporated Organisation registration number?`,
    routePath: '/permit-holder/company/number',
    nextPath: '/permit-holder/company/wrong-type',
    validCompanyNumber: '01234567',
    invalidCompanyNumberMessage: 'Enter a valid company registration number with either 8 digits or 2 letters and 6 digits'
  },
  'Limited Liability Partnership': {
    pageHeading: 'What is the company number for the  limited liability partnership?',
    routePath: '/permit-holder/limited-liability-partnership/number',
    nextPath: '/permit-holder/limited-liability-partnership/status-not-active',
    validCompanyNumber: 'OC234567',
    invalidCompanyNumberMessage: 'Enter a valid company registration number with 2 letters and 6 digits'
  }
}

Object.entries(routes).forEach(([companyType, { pageHeading, charityPermitHolder, routePath, nextPath, validCompanyNumber, invalidCompanyNumberMessage }]) => {
  lab.experiment(companyType, () => {
    let sandbox
    let mocks

    lab.beforeEach(() => {
      mocks = new Mocks()

      mocks.account.companyNumber = validCompanyNumber

      if (charityPermitHolder) {
        mocks.recovery.charityDetail = mocks.charityDetail
      }

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()

      // Stub methods
      sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
      sandbox.stub(Account, 'getByCompanyNumber').value(() => mocks.account)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(Application.prototype, 'save').value(() => undefined)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    lab.experiment('Company number page tests:', () => {
      new GeneralTestHelper({ lab, routePath }).test()

      lab.experiment(`GET ${routePath}`, () => {
        let doc
        let getRequest

        lab.beforeEach(() => {
          getRequest = {
            method: 'GET',
            url: routePath,
            headers: {},
            payload: {}
          }
        })

        lab.test('should have a back link', async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          const element = doc.getElementById('back-link')
          Code.expect(element).to.exist()
        })

        lab.test('success', async () => {
          doc = await GeneralTestHelper.getDoc(getRequest)

          Code.expect(GeneralTestHelper.getText(doc.getElementById('page-heading'))).to.equal(pageHeading)
          Code.expect(GeneralTestHelper.getText(doc.getElementById('submit-button'))).to.equal('Continue')
          Code.expect(doc.getElementById('company-number').getAttribute('value')).to.equal(mocks.account.companyNumber)
          Code.expect(doc.getElementById('overseas-help')).to.exist()
        })

        lab.experiment('failure', () => {
          lab.test('error screen when failing to recover the application', async () => {
            const spy = sandbox.spy(LoggingService, 'logError')
            RecoveryService.createApplicationContext = () => {
              throw new Error('recovery failed')
            }

            const res = await server.inject(getRequest)
            Code.expect(spy.callCount).to.equal(1)
            Code.expect(res.statusCode).to.equal(500)
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
            payload: { 'company-number': validCompanyNumber }
          }
        })

        lab.afterEach(() => {})

        lab.experiment('success', () => {
          lab.test('when account is saved', async () => {
            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(nextPath)
          })

          lab.test('when account is updated', async () => {
            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(nextPath)
          })
        })

        lab.experiment('invalid', () => {
          const checkValidationError = async (companyNumber, expectedErrorMessage) => {
            postRequest.payload['company-number'] = companyNumber
            const doc = await GeneralTestHelper.getDoc(postRequest)

            // Panel summary error item
            Code.expect(GeneralTestHelper.getText(doc.getElementById('error-summary-list-item-0'))).to.equal(expectedErrorMessage)

            // Company number field error
            Code.expect(doc.getElementById('company-number').getAttribute('class')).contains('form-control-error')
            Code.expect(GeneralTestHelper.getText(doc.getElementById('company-number-error'))).to.equal(expectedErrorMessage)

            // Company number field contains payload
            Code.expect(doc.getElementById('company-number').getAttribute('value')).to.equal(companyNumber)
          }

          lab.test('when company number is empty', async () => {
            checkValidationError('', 'Enter a company registration number')
          })

          lab.test('when company number is not the right length', async () => {
            checkValidationError('01234', invalidCompanyNumberMessage)
          })

          lab.test('when company number contains invalid characters', async () => {
            checkValidationError('########', invalidCompanyNumberMessage)
          })

          if (companyType === 'Limited Liability Partnership') {
            lab.test('when company number contains only digits', async () => {
              checkValidationError('01234567', invalidCompanyNumberMessage)
            })
          }
        })

        lab.experiment('failure', () => {
          lab.beforeEach(() => {
            delete mocks.account.companyNumber
          })

          lab.test('error screen when failing to get the account by the company number', async () => {
            const spy = sandbox.spy(LoggingService, 'logError')
            Account.getByCompanyNumber = () => {
              throw new Error('read failed')
            }

            // Delete the account id to force an account create
            delete mocks.account.id
            const res = await server.inject(postRequest)
            Code.expect(spy.callCount).to.equal(1)
            Code.expect(res.statusCode).to.equal(500)
          })

          lab.test('error screen when save fails', async () => {
            const spy = sandbox.spy(LoggingService, 'logError')
            Account.prototype.save = () => Promise.reject(new Error('save failed'))

            Account.getByCompanyNumber = () => new Account()

            const res = await server.inject(postRequest)
            Code.expect(spy.callCount).to.equal(1)
            Code.expect(res.statusCode).to.equal(500)
          })
        })
      })
    })
  })
})
