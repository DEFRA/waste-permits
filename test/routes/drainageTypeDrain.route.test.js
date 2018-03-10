'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const StandardRule = require('../../src/models/standardRule.model')
const DrainageTypeDrain = require('../../src/models/taskList/drainageTypeDrain.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

const routePath = '/drainage-type/drain'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakeStandardRule
let sandbox

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
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(DrainageTypeDrain, 'isComplete').value(() => false)
  sandbox.stub(DrainageTypeDrain, 'updateCompleteness').value(() => {})
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => new Application(fakeStandardRule))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Where does the vehicle storage area drain to? page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`GET ${routePath}`, () => {
    let request

    const checkCommonElements = async (doc) => {
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Confirm you have suitable vehicle storage areas')
      Code.expect(doc.getElementById('standard-rule-code').firstChild.nodeValue).to.equal(fakeStandardRule.code)
      Code.expect(doc.getElementById('standard-rule-link').getAttribute('href')).to.equal(fakeStandardRule.guidanceUrl)

      GeneralTestHelper.checkElementsExist(doc, [
        'storage-confirmation-paragraph-1',
        'storage-confirmation-paragraph-2',
        'storage-confirmation-paragraph-3',
        'deemed-evidence-description-list-item-1',
        'deemed-evidence-description-list-item-2',
        'deemed-evidence-description-list-item-3',
        'declaration-warning-notice-hidden',
        'declaration-warning-notice-content',
        'legal-wording-paragraph'
      ])
    }

    const getDoc = async (request) => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)
      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')
      return doc
    }

    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('when not completed', async () => {
        const doc = await getDoc(request)
        checkCommonElements(doc)

        Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Our storage meets these rules')
        Code.expect(doc.getElementById('confirm-result-message')).to.not.exist()
      })

      lab.test('when completed', async () => {
        DrainageTypeDrain.isComplete = () => true
        const doc = await getDoc(request)
        checkCommonElements(doc)

        Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Return to task list')
        Code.expect(doc.getElementById('confirm-result-message')).to.exist()
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        DrainageTypeDrain.isComplete = () => {
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
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
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
        DrainageTypeDrain.updateCompleteness = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        DrainageTypeDrain.updateCompleteness = () => {
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
