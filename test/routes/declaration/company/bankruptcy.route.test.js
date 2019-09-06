'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const GeneralTestHelper = require('../../generalTestHelper.test')
const Mocks = require('../../../helpers/mocks')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const Application = require('../../../../src/persistence/entities/application.entity')
const PermitHolderDetails = require('../../../../src/models/taskList/permitHolderDetails.task')
const LoggingService = require('../../../../src/services/logging.service')
const RecoveryService = require('../../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../../src/constants')
const { PERMIT_HOLDER_TYPES } = require('../../../../src/dynamics')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  Object.assign(mocks.application, {
    bankruptcyDetails: 'BANKRUPTCY DETAILS',
    bankruptcy: 'yes'
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(PermitHolderDetails, 'updateCompleteness').value(() => true)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const routes = {
  'Company': {
    permitHolderType: PERMIT_HOLDER_TYPES.LIMITED_COMPANY
  },
  'Individual': {
    permitHolderType: PERMIT_HOLDER_TYPES.INDIVIDUAL
  },
  'Partnership': {
    permitHolderType: PERMIT_HOLDER_TYPES.PARTNERSHIP
  },
  'Limited Liability Partnership': {
    permitHolderType: PERMIT_HOLDER_TYPES.LIMITED_LIABILITY_PARTNERSHIP
  },
  'Public Body': {
    pageHeading: `Does anyone connected with the public body or local authority have current or past bankruptcy or insolvency proceedings to declare?`,
    permitHolderType: PERMIT_HOLDER_TYPES.PUBLIC_BODY,
    routePath: '/permit-holder/public-body/bankruptcy-insolvency'
  },
  'Charity Body': {
    pageHeading: `Does anyone connected with the body have current or past bankruptcy or insolvency proceedings to declare?`,
    isCharity: true,
    permitHolderType: PERMIT_HOLDER_TYPES.PUBLIC_BODY,
    routePath: '/permit-holder/public-body/bankruptcy-insolvency'
  }
}

Object.entries(routes).forEach(([operator, {
  pageHeading = 'Do you have current or past bankruptcy or insolvency proceedings to declare?',
  isCharity = false,
  permitHolderType,
  routePath = '/permit-holder/company/bankruptcy-insolvency',
  nextPath = '/task-list',
  errorPath = '/errors/technical-problem'
}]) => {
  lab.experiment(`${operator} Declare Bankruptcy tests:`, () => {
    new GeneralTestHelper({ lab, routePath }).test()

    lab.experiment(`GET ${routePath}`, () => {
      let doc
      let getRequest

      lab.beforeEach(() => {
        mocks.recovery.permitHolderType = permitHolderType

        if (isCharity) {
          mocks.recovery.charityDetail = mocks.charityDetail
        }

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

      lab.experiment('success', () => {
        lab.test(`with operator type of ${permitHolderType.type} shows correct conditional content`, async () => {
          doc = await GeneralTestHelper.getDoc(getRequest)

          Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
          Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
          Code.expect(doc.getElementById('declaration-details').firstChild.nodeValue).to.equal(mocks.application.bankruptcyDetails)
          Code.expect(doc.getElementById('declaration-hint')).to.not.exist()
          Code.expect(doc.getElementById('declaration-notice')).to.exist()

          if (permitHolderType === PERMIT_HOLDER_TYPES.LIMITED_COMPANY) {
            Code.expect(doc.getElementById('operator-type-is-limited-company')).to.exist()
          } else {
            Code.expect(doc.getElementById('operator-type-is-limited-company')).to.not.exist()
          }

          if (permitHolderType === PERMIT_HOLDER_TYPES.INDIVIDUAL) {
            Code.expect(doc.getElementById('operator-type-is-individual')).to.exist()
          } else {
            Code.expect(doc.getElementById('operator-type-is-lindividual')).to.not.exist()
          }

          if (permitHolderType === PERMIT_HOLDER_TYPES.PARTNERSHIP) {
            Code.expect(doc.getElementById('operator-type-is-partnership')).to.exist()
          } else {
            Code.expect(doc.getElementById('operator-type-is-partnership')).to.not.exist()
          }

          if (permitHolderType === PERMIT_HOLDER_TYPES.PUBLIC_BODY) {
            Code.expect(doc.getElementById('operator-type-is-public-body')).to.exist()
          } else {
            Code.expect(doc.getElementById('operator-type-is-public-body')).to.not.exist()
          }

          if (permitHolderType === PERMIT_HOLDER_TYPES.LIMITED_LIABILITY_PARTNERSHIP) {
            Code.expect(doc.getElementById('operator-type-is-limited-liability-partnership')).to.exist()
          } else {
            Code.expect(doc.getElementById('operator-type-is-limited-liability-partnership')).to.not.exist()
          }
        })
      })

      lab.experiment('failure', () => {
        lab.test('redirects to error screen when failing to recover the application', async () => {
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
          payload: {
            'declared': mocks.application.bankruptcy,
            'declaration-details': mocks.application.bankruptcyDetails
          }
        }
      })

      lab.afterEach(() => {})

      lab.experiment('success', () => {
        lab.test('when application is saved', async () => {
          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextPath)
        })
      })

      lab.experiment('invalid', () => {
        const checkValidationMessage = async (fieldId, expectedErrorMessage, shouldHaveErrorClass) => {
          const doc = await GeneralTestHelper.getDoc(postRequest)
          // Panel summary error item
          Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

          // Relevant bankruptcy details field error
          if (shouldHaveErrorClass) {
            Code.expect(doc.getElementById(`${fieldId}`).getAttribute('class')).contains('form-control-error')
          }
          Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
        }

        lab.test('when bankruptcy not checked', async () => {
          postRequest.payload = {}
          await checkValidationMessage('declared', `Select yes if you have bankruptcy or insolvency to declare or no if you do not`)
        })

        lab.test('when bankruptcy set to yes and no details entered', async () => {
          postRequest.payload = { 'declared': 'yes' }
          await checkValidationMessage('declaration-details', 'Enter details of the bankruptcy or insolvency', true)
        })

        lab.test('when bankruptcy set to yes and details entered with 2001 characters', async () => {
          postRequest.payload = { 'declared': 'yes', 'declaration-details': 'a'.repeat(2001) }
          await checkValidationMessage('declaration-details', 'You can only enter 2,000 characters - please shorten what you have written', true)
        })
      })

      lab.experiment('failure', () => {
        lab.test('redirects to error screen when failing to recover the application', async () => {
          const spy = sandbox.spy(LoggingService, 'logError')
          RecoveryService.createApplicationContext = () => {
            throw new Error('recovery failed')
          }

          const res = await server.inject(postRequest)
          Code.expect(spy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(500)
        })

        lab.test('redirects to error screen when save fails', async () => {
          const spy = sandbox.spy(LoggingService, 'logError')
          Application.prototype.save = () => Promise.reject(new Error('save failed'))

          const res = await server.inject(postRequest)
          Code.expect(spy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(500)
        })
      })
    })
  })
})
