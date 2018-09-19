'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../../generalTestHelper.test')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const Application = require('../../../../src/models/application.model')
const LoggingService = require('../../../../src/services/logging.service')
const RecoveryService = require('../../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../../src/constants')
const { PERMIT_HOLDER_TYPES } = require('../../../../src/dynamics')

let sandbox

let fakeApplication
let fakeRecovery
let fakePermitHolderType

const routePath = '/permit-holder/company/declare-offences'
const nextRoutePath = '/permit-holder/company/bankruptcy-insolvency'
const errorPath = '/errors/technical-problem'

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    relevantOffencesDetails: 'RELEVANT OFFENCES DETAILS',
    relevantOffences: 'yes'
  }

  fakePermitHolderType = PERMIT_HOLDER_TYPES.LIMITED_COMPANY

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    application: new Application(fakeApplication),
    permitHolderType: fakePermitHolderType
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => {})
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Company Declare Offences tests:', () => {
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

    lab.experiment('success', () => {
      lab.test('shows all static element', async () => {
        doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Does anyone connected with your business have a conviction for a relevant offence?')
        Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
        Code.expect(doc.getElementById('declaration-details').firstChild.nodeValue).to.equal(fakeApplication.relevantOffencesDetails)
        Code.expect(doc.getElementById('declare-offences-hint')).to.exist()
        Code.expect(doc.getElementById('declaration-notice')).to.not.exist()
      })

      lab.test('with operator type of limited company shows correct conditional content', async () => {
        fakePermitHolderType = PERMIT_HOLDER_TYPES.LIMITED_COMPANY
        doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('operator-type-is-limited-company')).to.exist()
        Code.expect(doc.getElementById('operator-type-is-individual')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-partnership')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-limited-liability-partnership')).to.not.exist()
      })

      lab.test('with operator type of individual shows correct conditional content', async () => {
        fakePermitHolderType = PERMIT_HOLDER_TYPES.INDIVIDUAL
        doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('operator-type-is-individual')).to.exist()
        Code.expect(doc.getElementById('operator-type-is-limited-company')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-partnership')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-limited-liability-partnership')).to.not.exist()
      })

      lab.test('with operator type of partnership shows correct conditional content', async () => {
        fakePermitHolderType = PERMIT_HOLDER_TYPES.PARTNERSHIP
        doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('operator-type-is-partnership')).to.exist()
        Code.expect(doc.getElementById('operator-type-is-individual')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-limited-company')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-limited-liability-partnership')).to.not.exist()
      })

      lab.test('with operator type of limited liability partnership shows correct conditional content', async () => {
        fakePermitHolderType = PERMIT_HOLDER_TYPES.LIMITED_LIABILITY_PARTNERSHIP
        doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('operator-type-is-limited-liability-partnership')).to.exist()
        Code.expect(doc.getElementById('operator-type-is-individual')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-limited-company')).to.not.exist()
        Code.expect(doc.getElementById('operator-type-is-partnership')).to.not.exist()
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
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
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
          'declared': fakeApplication.relevantOffences,
          'declaration-details': fakeApplication.relevantOffencesDetails
        }
      }
    })

    lab.afterEach(() => {})

    lab.experiment('success', () => {
      lab.test('when application is saved', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      const checkValidationMessage = async (fieldId, expectedErrorMessage, shouldHaveErrorClass) => {
        const doc = await GeneralTestHelper.getDoc(postRequest)
        // Panel summary error item
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal(expectedErrorMessage)

        // Relevant offences details field error
        if (shouldHaveErrorClass) {
          Code.expect(doc.getElementById(`${fieldId}`).getAttribute('class')).contains('form-control-error')
        }
        Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
      }

      lab.test('when offences not checked', async () => {
        postRequest.payload = {}
        await checkValidationMessage('declared', `Select yes if you have convictions to declare or no if you do not`)
      })

      lab.test('when offences set to yes and no details entered', async () => {
        postRequest.payload = { 'declared': 'yes' }
        await checkValidationMessage('declaration-details', 'Enter details of the convictions', true)
      })

      lab.test('when offences set to yes and details entered with 2001 characters', async () => {
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
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
