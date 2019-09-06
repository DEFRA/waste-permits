'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../../helpers/mocks')
const GeneralTestHelper = require('../../generalTestHelper.test')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const Application = require('../../../../src/persistence/entities/application.entity')
const Confidentiality = require('../../../../src/models/taskList/confidentiality.task')
const LoggingService = require('../../../../src/services/logging.service')
const RecoveryService = require('../../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../../src/constants')

const routePath = '/confidentiality'
const nextRoutePath = '/task-list'

let sandbox
let mocks

function trimLines (value) {
  return value.replace(/[\\n\s]+\s/g, `\n`)
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(Confidentiality, 'updateCompleteness').value(() => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Is part of your application commercially confidential? page tests:', () => {
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

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Is part of your application commercially confidential?')
      Code.expect(trimLines(doc.getElementById('declaration-details').firstChild.nodeValue)).to.equal(mocks.application.confidentialityDetails)
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
      Code.expect(doc.getElementById('confidentiality-hint')).to.exist()
      Code.expect(doc.getElementById('declaration-notice')).to.not.exist()
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
        payload: {
          'declared': mocks.application.confidentiality,
          'declaration-details': mocks.application.confidentialityDetails
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

        // Relevant confidentiality details field error
        if (shouldHaveErrorClass) {
          Code.expect(doc.getElementById(`${fieldId}`).getAttribute('class')).contains('form-control-error')
        }
        Code.expect(doc.getElementById(`${fieldId}-error`).firstChild.firstChild.nodeValue).to.equal(expectedErrorMessage)
      }

      lab.test('when confidentiality not checked', async () => {
        postRequest.payload = {}
        await checkValidationMessage('declared', `Select yes if you want to claim confidentiality or no if you do not`)
      })

      lab.test('when confidentiality set to yes and no details entered', async () => {
        postRequest.payload = { 'declared': 'yes' }
        await checkValidationMessage('declaration-details', 'Explain what information is confidential and why', true)
      })

      lab.test('when confidentiality set to yes and details entered with 2001 characters', async () => {
        postRequest.payload = { 'declared': 'yes', 'declaration-details': 'a'.repeat(2001) }
        await checkValidationMessage('declaration-details', 'You can only enter 2,000 characters - please shorten what you have written', true)
      })
    })

    lab.experiment('failure', () => {
      lab.test('error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })

      lab.test('error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })
})
