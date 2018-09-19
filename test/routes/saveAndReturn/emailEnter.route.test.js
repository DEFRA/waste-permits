'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/models/application.model')
const SaveAndReturn = require('../../../src/models/taskList/saveAndReturn.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/save-return/email'
const nextRoutePath = '/save-return/confirm'
const emailSentPath = '/save-return/email-sent-task-check'
const errorPath = '/errors/technical-problem'

let fakeApplication
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    saveAndReturnEmail: 'valid@email.com'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(SaveAndReturn, 'isComplete').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Save and return email page tests:', () => {
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
        Code.expect(res.headers['location']).to.equal(emailSentPath)
      })

      lab.test('when incomplete', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        GeneralTestHelper.checkElementsExist(doc, [
          'back-link',
          'submit-button',
          'save-and-return-email-label'
        ])
        Code.expect(doc.getElementById('save-and-return-email').getAttribute('value')).to.equal(fakeApplication.saveAndReturnEmail)
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
          'save-and-return-email': fakeApplication.saveAndReturnEmail
        }
      }
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
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
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
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
