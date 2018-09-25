'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const DrainageTypeDrain = require('../../src/models/taskList/drainageTypeDrain.model')
const StandardRule = require('../../src/models/standardRule.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const DrainageTypes = {
  SEWER: '910400000',
  BLIND_SUMP: '910400001',
  OIL_SEPARATOR: '910400002',
  WATERCOURSE: '910400003'
}

const DRAINAGE_FAIL_PERMIT = 'SR2015 No 13'

const routePath = '/drainage-type/drain'
const nextRoutePath = '/task-list'
const failRoutePath = '/drainage-type/contact-us'
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeStandardRule
let sandbox

const checkCommonElements = async (doc) => {
  const pageHeading = 'Where does the vehicle storage area drain to?'
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
  Code.expect(doc.getElementById('drainage-type-legend').firstChild.nodeValue).to.equal(pageHeading)

  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  const { BLIND_SUMP, OIL_SEPARATOR, SEWER, WATERCOURSE } = DrainageTypes

  Code.expect(doc.getElementById('sewer').getAttribute('value')).to.equal(SEWER)
  Code.expect(doc.getElementById('blind-sump').getAttribute('value')).to.equal(BLIND_SUMP)
  Code.expect(doc.getElementById('oil-separator').getAttribute('value')).to.equal(OIL_SEPARATOR)
  Code.expect(doc.getElementById('watercourse').getAttribute('value')).to.equal(WATERCOURSE)
  Code.expect(doc.getElementById('sewer-label').firstChild.nodeValue).to.equal('A sewer under a consent from the local water company')
  Code.expect(doc.getElementById('blind-sump-label').firstChild.nodeValue).to.equal('A blind sump to be taken off-site in a tanker for disposal or recovery')
  Code.expect(doc.getElementById('oil-separator-label').firstChild.nodeValue).to.equal('An oil separator, interceptor or other drainage system that is appropriately designed, operated and maintained')
  Code.expect(doc.getElementById('oil-separator-label-hint').firstChild.nodeValue).to.equal('If you use this system you can only store undamaged vehicles on the area. The drainage system must be designed, constructed and maintained to ensure the discharge does not adversely impact the water quality of the receiving water body.')
  Code.expect(doc.getElementById('watercourse-label').firstChild.nodeValue).to.equal('Surface water drains, a watercourse, the ground or a water body')

  Code.expect(doc.getElementById('drainage-message')).to.exist()

  GeneralTestHelper.checkElementsDoNotExist(doc, [
    'sewer-label-hint',
    'blind-sump-label-hint',
    'watercourse-label-hint'
  ])
}

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
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
  sandbox.stub(DrainageTypeDrain, 'isComplete').value(() => false)
  sandbox.stub(DrainageTypeDrain, 'updateCompleteness').value(() => {})
  sandbox.stub(DrainageTypeDrain, 'clearCompleteness').value(() => {})
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => new Application(fakeStandardRule))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Where does the vehicle storage area drain to? page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let request

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('success', async () => {
      const doc = await GeneralTestHelper.getDoc(request)
      checkCommonElements(doc)
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
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    const { BLIND_SUMP, OIL_SEPARATOR, SEWER, WATERCOURSE } = DrainageTypes
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'drainage-type': SEWER
        }
      }
    })

    lab.experiment('success', async () => {
      lab.test('when sewer selected', async () => {
        const spy = sinon.spy(DrainageTypeDrain, 'updateCompleteness')
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when blind sump selected', async () => {
        postRequest.payload['drainage-type'] = BLIND_SUMP
        const spy = sinon.spy(DrainageTypeDrain, 'updateCompleteness')
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when oil separator selected and standard rule is allowed', async () => {
        postRequest.payload['drainage-type'] = OIL_SEPARATOR
        const spy = sinon.spy(DrainageTypeDrain, 'updateCompleteness')
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when oil separator selected and standard rule is not allowed', async () => {
        postRequest.payload['drainage-type'] = OIL_SEPARATOR
        const spy = sinon.spy(DrainageTypeDrain, 'clearCompleteness')
        fakeStandardRule.code = DRAINAGE_FAIL_PERMIT
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(failRoutePath)
      })

      lab.test('when watercourse selected', async () => {
        postRequest.payload['drainage-type'] = WATERCOURSE
        const spy = sinon.spy(DrainageTypeDrain, 'clearCompleteness')
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(failRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when drainage type not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'drainage-type', 'Select where the area drains to')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when save fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        DrainageTypeDrain.updateCompleteness = () => {
          throw new Error('update failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when unknown drainage-type is selected', async () => {
        postRequest.payload['drainage-type'] = '999999999'
        const spy = sandbox.spy(LoggingService, 'logError')

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
