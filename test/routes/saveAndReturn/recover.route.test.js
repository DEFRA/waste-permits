'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/models/application.model')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const ApplicationReturn = require('../../../src/models/applicationReturn.model')
const StandardRule = require('../../../src/models/standardRule.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../../src/constants')

const fakeSlug = 'SLUG'

const routePath = `/r/${fakeSlug}`
const nextRoutePath = '/task-list'
const recoveryFailedPath = '/errors/recovery-failed'
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeApplicationLine
let fakeApplicationReturn
let fakeStandardRule
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER'
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID'
  }

  fakeApplicationReturn = {
    applicationId: fakeApplication.id,
    slug: fakeSlug
  }

  fakeStandardRule = {
    id: 'STANDARD_RULE_ID',
    standardRuleTypeId: 'STANDARD_RULE_TYPE_ID',
    code: 'CODE',
    permitName: 'PERMIT_NAME'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(CookieService, 'generateCookie').value(() => ({authToken: 'AUTH_TOKEN'}))
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(ApplicationLine, 'getByApplicationId').value(() => new Application(fakeApplicationLine))
  sandbox.stub(ApplicationReturn, 'getBySlug').value(() => new Application(fakeApplicationReturn))
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => new Application(fakeStandardRule))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('We found your application:', () => {
  new GeneralTestHelper(lab, routePath).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

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
      lab.test('when found', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        GeneralTestHelper.checkElementsExist(doc, [
          'submit-button',
          'reference-number',
          'permit-name-and-code'
        ])
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('We found your application')
        Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Go to your application')
        Code.expect(doc.getElementById('application-number').firstChild.nodeValue).to.equal(fakeApplication.applicationNumber)
        Code.expect(doc.getElementById('permit-name').firstChild.nodeValue).to.equal(fakeStandardRule.permitName)
        Code.expect(doc.getElementById('code').firstChild.nodeValue).to.equal(fakeStandardRule.code)
      })

      lab.test('when not found', async () => {
        ApplicationReturn.getBySlug = () => undefined
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(recoveryFailedPath)
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
          'save-and-return-email': fakeApplication.saveAndReturnEmail
        }
      }
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
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
    })
  })
})
