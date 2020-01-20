'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const RecoveryService = require('../../src/services/recovery.service')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const PreApplicationModel = require('../../src/models/preApplication.model')
const PreApplicationTask = require('../../src/models/taskList/preApplication.task')

const Routes = require('../../src/routes')
const { PRE_APPLICATION_REFERENCE } = Routes

const routePath = PRE_APPLICATION_REFERENCE.path
const nextRoutePath = Routes[PRE_APPLICATION_REFERENCE.nextRoute].path

const SAMPLE_REFERENCE = 'EPR/WE1234AB/A001'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(PreApplicationModel, 'get').callsFake(async () => mocks.preApplication)
  sandbox.stub(PreApplicationModel.prototype, 'save').callsFake(async () => undefined)
  sandbox.stub(PreApplicationTask, 'updateCompleteness').callsFake(async () => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Pre Application (Provide your pre-application reference) page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.afterEach(() => {
        mocks.application.preApplicationReference = ''
      })

      lab.test('Success', async () => {
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(200)
      })

      lab.test('The page should have a back link', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)

        const element = doc.getElementById('back-link')
        Code.expect(element).to.exist()
      })

      lab.test('Reference should be entered if it exists in the application', async () => {
        mocks.application.preApplicationReference = SAMPLE_REFERENCE

        const doc = await GeneralTestHelper.getDoc(getRequest)
        const element = doc.getElementById('pre-application-reference')

        Code.expect(element.getAttribute('value')).to.equal(SAMPLE_REFERENCE)
      })

      lab.test('Reference should be empty if it does not exist in the application', async () => {
        mocks.application.preApplicationReference = ''

        const doc = await GeneralTestHelper.getDoc(getRequest)
        const element = doc.getElementById('pre-application-reference')

        Code.expect(element.getAttribute('value')).to.equal('')
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
        Code.expect(res.statusCode).to.equal(500)
      })
    })

    lab.experiment(`POST ${routePath}`, () => {
      let postRequest

      lab.beforeEach(() => {
        postRequest = {
          method: 'POST',
          url: routePath,
          headers: {},
          payload: {}
        }
      })

      lab.experiment('success', async () => {
        lab.test('when a valid string is entered', async () => {
          postRequest.payload['pre-application-reference'] = SAMPLE_REFERENCE

          const res = await server.inject(postRequest)

          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })
      })

      lab.experiment('invalid', () => {
        lab.test('when no string is entered', async () => {
          postRequest.payload['pre-application-reference'] = ''
          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'pre-application-reference', 'Enter a pre-application reference number')
        })

        lab.test('when an invalid string is entered', async () => {
          postRequest.payload['pre-application-reference'] = 'INVALID_STRING'
          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'pre-application-reference', 'Enter a reference number in the correct format')
        })
      })
    })
  })
})
