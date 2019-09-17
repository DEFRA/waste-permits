'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const DrainageTypeDrain = require('../../src/models/taskList/drainageTypeDrain.task')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const DrainageTypes = {
  SEWER: 910400000,
  BLIND_SUMP: 910400001,
  OIL_SEPARATOR: 910400002,
  WATERCOURSE: 910400003,
  UNKNOWN: 999999999
}

const DRAINAGE_FAIL_PERMIT = 'SR2015 No 13'

const routePath = '/drainage-type/contact-us'
const redirectPath = '/task-list'

const checkCommonElements = async (doc) => {
  const pageHeading = 'Your drainage system is not suitable - please contact us'
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)

  GeneralTestHelper.checkElementsExist(doc, [
    'drainage-fail-paragraph-1',
    'drainage-fail-paragraph-4',
    'drainage-contact-heading',
    'drainage-contact-email',
    'drainage-contact-email-link',
    'drainage-contact-telephone',
    'drainage-contact-telephone-link',
    'drainage-contact-telephone-outside-uk',
    'drainage-contact-telephone-outside-uk-link',
    'drainage-contact-minicom',
    'drainage-contact-minicom-link',
    'drainage-contact-availability'
  ])
}

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  mocks.application.drainageType = DrainageTypes.WATERCOURSE
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(DrainageTypeDrain, 'isComplete').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Your drainage system is not suitable - please contact us page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({ excludeCookiePostTests: true })

  lab.experiment(`GET ${routePath}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('when drainage type is a sewer', async () => {
        mocks.application.drainageType = DrainageTypes.SEWER
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(redirectPath)
      })

      lab.test('when drainage type is a blind sump', async () => {
        mocks.application.drainageType = DrainageTypes.BLIND_SUMP
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(redirectPath)
      })

      lab.test('when drainage type is an oil separator', async () => {
        mocks.application.drainageType = DrainageTypes.OIL_SEPARATOR
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(redirectPath)
      })

      lab.test('when drainage type is an oil separator and standard rule is an exception', async () => {
        mocks.application.drainageType = DrainageTypes.OIL_SEPARATOR
        mocks.standardRule.code = DRAINAGE_FAIL_PERMIT
        const doc = await GeneralTestHelper.getDoc(request)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('drainage-fail-paragraph-3')).to.exist()
      })

      lab.test('when drainage type is a watercourse', async () => {
        mocks.application.drainageType = DrainageTypes.WATERCOURSE
        const doc = await GeneralTestHelper.getDoc(request)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('drainage-fail-paragraph-2')).to.exist()
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(request)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })

      lab.test('redirects to error screen when unknown drainage-type is selected', async () => {
        mocks.application.drainageType = DrainageTypes.UNKNOWN
        const spy = sandbox.spy(LoggingService, 'logError')
        const res = await server.inject(request)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })
})
