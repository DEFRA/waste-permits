'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/persistence/entities/application.entity')
const SaveAndReturn = require('../../../src/models/taskList/saveAndReturn.task')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/save-return/confirm'
const nextRoutePath = '/save-return/email-sent-check'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'sendSaveAndReturnEmail').value(() => {})
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(SaveAndReturn, 'isComplete').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Save and return confirm page tests:', () => {
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
      lab.test('when complete', async () => {
        SaveAndReturn.isComplete = () => true
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test('when incomplete', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        GeneralTestHelper.checkElementsExist(doc, [
          'back-link',
          'submit-button',
          'save-and-return-email-label',
          'email-hint'
        ])
        Code.expect(doc.getElementById('save-and-return-email').getAttribute('value')).to.equal(mocks.application.saveAndReturnEmail)
        Code.expect(doc.getElementById('save-and-return-email-label').getAttribute('aria-describedby')).to.equal('email-hint')
        Code.expect(doc.getElementById('got-email').getAttribute('value')).to.equal('false')
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
          'got-email': 'false',
          'save-and-return-email': mocks.application.saveAndReturnEmail
        }
      }
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRoutePath)
    })

    lab.experiment('invalid', () => {
      lab.test('when email is not entered', async () => {
        delete postRequest.payload['save-and-return-email']
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'save-and-return-email', 'Enter an email address')
      })

      lab.test('when email is not entered', async () => {
        postRequest.payload['save-and-return-email'] = 'invalid_email_address'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'save-and-return-email', 'Enter a valid email address')
      })

      lab.test('when requesting an email to be sent fails', async () => {
        Application.prototype.sendSaveAndReturnEmail = () => {
          throw new Error('sendSaveAndReturnEmail failed')
        }

        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'save-and-return-email', 'Sorry, we cannot send emails just now. This is a technical fault and we have been notified. Please try the service again later.')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
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
