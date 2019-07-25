'use strict'

const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationReturn = require('../../../src/persistence/entities/applicationReturn.entity')
const SaveAndReturn = require('../../../src/models/taskList/saveAndReturn.task')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const FeatureConfig = require('../../../src/config/featureConfig')
const Config = require('../../../src/config/config')
const { COOKIE_RESULT } = require('../../../src/constants')

let fakeAppUrl
let fakeRecoveryLink
let origin

module.exports = (lab, { routePath, nextRoutePath, resentPath, errorPath, pageHeading, firstTime }) => {
  let sandbox
  let mocks

  lab.beforeEach(() => {
    mocks = new Mocks()

    fakeAppUrl = 'http://Waste-Permits-Url'

    fakeRecoveryLink = `${fakeAppUrl}/r/${mocks.applicationReturn.slug}`

    origin = undefined

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(Application, 'getById').value(() => mocks.application)
    sandbox.stub(Application.prototype, 'sendSaveAndReturnEmail').value(() => {
      origin = fakeAppUrl
    })
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
    sandbox.stub(Application.prototype, 'save').value(() => {})
    sandbox.stub(ApplicationReturn, 'getByApplicationId').value(() => mocks.applicationReturn)
    sandbox.stub(SaveAndReturn, 'isComplete').value(() => false)
    sandbox.stub(SaveAndReturn, 'updateCompleteness').value(() => {})
    sandbox.stub(FeatureConfig, 'hasDisplayRecoveryLinkFeature').value(false)
    sandbox.stub(Config, 'wastePermitsAppUrl').value(fakeAppUrl)
    sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('Save and return email sent check page tests:', () => {
    new GeneralTestHelper({ lab, routePath }).test()

    const checkCommonElements = async (doc) => {
      GeneralTestHelper.checkElementsExist(doc, [
        'back-link',
        'email-sent-paragraph-1',
        'save-and-return-email-label',
        'find-email-list-item-1',
        'find-email-list-item-2',
        'find-email-list-item-3',
        'find-email-list-item-4'
      ])
      Code.expect(doc.getElementById('not-got-email').getAttribute('checked')).to.equal('')
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
      Code.expect(doc.getElementById('email-sent').firstChild.nodeValue).to.equal(mocks.application.saveAndReturnEmail)
      Code.expect(doc.getElementById('save-and-return-email').getAttribute('value')).to.equal(mocks.application.saveAndReturnEmail)
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

      if (firstTime) {
        Code.expect(doc.getElementById('spam-hint')).to.exist()
      } else {
        Code.expect(doc.getElementById('spam-hint')).to.not.exist()
      }
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
          Code.expect(doc.getElementById('recovery-link')).to.not.exist()
        })

        lab.test('when complete and display recovery link feature is true', async () => {
          SaveAndReturn.isComplete = () => true
          FeatureConfig.hasDisplayRecoveryLinkFeature = true
          const doc = await GeneralTestHelper.getDoc(getRequest)
          await checkCommonElements(doc)
          Code.expect(doc.getElementById('recovery-link').getAttribute('href')).to.equal(fakeRecoveryLink)
        })

        lab.test('when not complete', async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          await checkCommonElements(doc)
          Code.expect(doc.getElementById('got-email').getAttribute('checked')).to.equal('')
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

      lab.experiment('success', () => {
        lab.test('when got email selected', async () => {
          const res = await server.inject(postRequest)
          Code.expect(origin).to.equal(undefined)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })

        lab.test('when not got email selected', async () => {
          postRequest.payload = {
            'got-email': 'false',
            'save-and-return-email': 'valid@email.com'
          }
          const res = await server.inject(postRequest)
          Code.expect(origin).to.equal(fakeAppUrl)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(resentPath)
        })
      })

      lab.experiment('invalid', () => {
        lab.test('when either got email or email is missing are not selected', async () => {
          postRequest.payload = {}
          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'got-email', 'Select you got the email or cannot find it')
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

        lab.test('when requesting an email to be sent fails', async () => {
          postRequest.payload = {
            'got-email': 'false',
            'save-and-return-email': 'valid@email.com'
          }
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
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(errorPath)
        })

        lab.test('redirects to error screen when save fails', async () => {
          postRequest.payload = {
            'got-email': 'false',
            'save-and-return-email': 'valid@email.com'
          }
          const spy = sandbox.spy(LoggingService, 'logError')
          Application.prototype.save = () => {
            throw new Error('save failed')
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
