'use strict'

const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/models/application.model')
const SaveAndReturn = require('../../../src/models/taskList/saveAndReturn.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../../src/constants')

let fakeApplication
let sandbox

module.exports = (lab, {routePath, nextRoutePath, errorPath, pageHeading}) => {
  lab.beforeEach(() => {
    fakeApplication = {
      id: 'APPLICATION_ID',
      saveAndReturnEmail: 'blah@blah.com'
    }

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(LoggingService, 'logError').value(() => {})
    sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
    sandbox.stub(Application.prototype, 'save').value(() => {})
    sandbox.stub(SaveAndReturn, 'isComplete').value(() => false)
    sandbox.stub(SaveAndReturn, 'updateCompleteness').value(() => {})
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('Save and return email sent check page tests:', () => {
    new GeneralTestHelper(lab, routePath).test()

    const checkCommonElements = async (doc) => {
      GeneralTestHelper.checkElementsExist(doc, [
        'back-link',
        'email-sent-paragraph-1',
        'email-sent-paragraph-2'
      ])
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
      Code.expect(doc.getElementById('email-sent').firstChild.nodeValue).to.equal(fakeApplication.saveAndReturnEmail)
    }

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
          const doc = await GeneralTestHelper.getDoc(getRequest)
          await checkCommonElements(doc)
          Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Return to task list')
        })

        lab.test('when not complete', async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          await checkCommonElements(doc)
          GeneralTestHelper.checkElementsExist(doc, [
            'save-and-return-email-label',
            'find-email-list-item-1',
            'find-email-list-item-2',
            'find-email-list-item-3',
            'find-email-list-item-4'
          ])
          Code.expect(doc.getElementById('save-and-return-email').getAttribute('value')).to.equal(fakeApplication.saveAndReturnEmail)
          Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
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
            'got-email': 'true'
          }
        }
      })

      lab.test('success', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.experiment('invalid', () => {
        lab.test('when either got email or email is missing are not selected', async () => {
          postRequest.payload = {}
          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'got-email', 'Select you got the email or can’t find it')
        })

        lab.test('when email is not entered', async () => {
          postRequest.payload = {
            'got-email': 'false'
          }
          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'save-and-return-email', 'Enter an email address')
        })

        lab.test('when email is invalid', async () => {
          postRequest.payload = {
            'got-email': 'false',
            'save-and-return-email': 'invalid_email_address'
          }
          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'save-and-return-email', 'Enter a valid email address')
        })
      })

      lab.experiment('failure', () => {
        lab.test('redirects to error screen when failing to get the application ID', async () => {
          const spy = sinon.spy(LoggingService, 'logError')
          Application.getById = () => {
            throw new Error('read failed')
          }

          const res = await server.inject(postRequest)
          Code.expect(spy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(errorPath)
        })

        lab.test('redirects to error screen when save fails', async () => {
          const spy = sinon.spy(LoggingService, 'logError')
          Application.prototype.save = () => Promise.reject(new Error('save failed'))

          const res = await server.inject(postRequest)
          Code.expect(spy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(errorPath)
        })

        lab.test('redirects to error screen when updateCompletenesss fails', async () => {
          const spy = sinon.spy(LoggingService, 'logError')
          SaveAndReturn.updateCompleteness = () => {
            throw new Error('update failed')
          }

          const res = await server.inject(postRequest)
          Code.expect(spy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(errorPath)
        })
      })
    })
  })
}
