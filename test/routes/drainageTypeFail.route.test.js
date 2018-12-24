'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CharityDetail = require('../../src/models/charityDetail.model')
const DrainageTypeDrain = require('../../src/models/taskList/drainageTypeDrain.task')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
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
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeStandardRule
let sandbox

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

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    drainageType: DrainageTypes.WATERCOURSE
  }

  fakeStandardRule = {
    code: 'STANDARD_RULE_CODE',
    guidanceUrl: 'STANDARD_RULE_GUIDANCE_URL'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(CharityDetail, 'get').value(() => undefined)
  sandbox.stub(DrainageTypeDrain, 'isComplete').value(() => false)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => new Application(fakeStandardRule))
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
        fakeApplication.drainageType = DrainageTypes.SEWER
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(redirectPath)
      })

      lab.test('when drainage type is a blind sump', async () => {
        fakeApplication.drainageType = DrainageTypes.BLIND_SUMP
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(redirectPath)
      })

      lab.test('when drainage type is an oil separator', async () => {
        fakeApplication.drainageType = DrainageTypes.OIL_SEPARATOR
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(redirectPath)
      })

      lab.test('when drainage type is an oil separator and standard rule is an exception', async () => {
        fakeApplication.drainageType = DrainageTypes.OIL_SEPARATOR
        fakeStandardRule.code = DRAINAGE_FAIL_PERMIT
        const doc = await GeneralTestHelper.getDoc(request)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('drainage-fail-paragraph-3')).to.exist()
      })

      lab.test('when drainage type is a watercourse', async () => {
        fakeApplication.drainageType = DrainageTypes.WATERCOURSE
        const doc = await GeneralTestHelper.getDoc(request)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('drainage-fail-paragraph-2')).to.exist()
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(request)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when unknown drainage-type is selected', async () => {
        fakeApplication.drainageType = DrainageTypes.UNKNOWN
        const spy = sandbox.spy(LoggingService, 'logError')
        const res = await server.inject(request)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
