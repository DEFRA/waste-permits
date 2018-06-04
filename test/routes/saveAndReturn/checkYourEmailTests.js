'use strict'

const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/models/application.model')
const CookieService = require('../../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../../src/constants')

let fakeEmail
let fakeApplication
let numberOfMatchingEmails
let sandbox

module.exports = (lab, {routePath, nextPath, errorPath, pageHeading}) => {
  lab.beforeEach(() => {
    fakeEmail = 'valid@email.com'

    fakeApplication = {
      id: 'APPLICATION_ID',
      saveAndReturnEmail: fakeEmail
    }

    numberOfMatchingEmails = 10

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub cookies
    GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
      'saveAndReturnEmail': () => fakeEmail
    })

    // Stub methods
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
    sandbox.stub(Application, 'sendAllRecoveryEmails').value(() => numberOfMatchingEmails)
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment(`Check your email: Search for 'standard rules permit application' in your email page tests:`, () => {
    new GeneralTestHelper(lab, routePath).test({
      excludeCookieGetTests: true,
      excludeCookiePostTests: true,
      excludeAlreadySubmittedTest: true
    })

    const checkCommonElements = async (doc) => {
      GeneralTestHelper.checkElementsExist(doc, [
        'back-link',
        'email-hint',
        'email-summary',
        'save-and-return-email-label',
        'find-email-list-item-1',
        'find-email-list-item-2',
        'find-email-list-item-3',
        'find-email-list-item-4'
      ])
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Resend email')
      Code.expect(doc.getElementById('got-email').getAttribute('value')).to.equal('false')
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
        lab.test('when email is saved in the cookie', async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          await checkCommonElements(doc)
          Code.expect(doc.getElementById('email-sent-paragraph')).to.exist()
        })

        lab.test('when email is not saved in the cookie', async () => {
          fakeEmail = ''
          const doc = await GeneralTestHelper.getDoc(getRequest)
          await checkCommonElements(doc)
          Code.expect(doc.getElementById('email-link-paragraph')).to.exist()
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
        Code.expect(res.headers['location']).to.equal(nextPath)
      })

      lab.experiment('invalid', () => {
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

        lab.test('when requesting an email to be sent fails', async () => {
          postRequest.payload = {
            'got-email': 'false',
            'save-and-return-email': 'valid@email.com'
          }
          Application.sendAllRecoveryEmails = () => {
            throw new Error('sendAllRecoveryEmails failed')
          }

          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'save-and-return-email', 'Sorry, we cannot send emails just now. This is a technical fault and we have been notified. Please try the service again later.')
        })

        lab.test('when no matching applications are found for the entered email', async () => {
          postRequest.payload = {
            'got-email': 'false',
            'save-and-return-email': 'valid@email.com'
          }

          numberOfMatchingEmails = 0

          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'save-and-return-email', 'We cannot find any current applications for that email. Please check the email address.')
        })
      })
    })
  })
}
