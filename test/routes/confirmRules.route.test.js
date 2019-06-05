'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const ConfirmRules = require('../../src/models/taskList/confirmRules.task')
const LoggingService = require('../../src/services/logging.service')
const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/confirm-rules'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ConfirmRules, 'isComplete').value(() => false)
  sandbox.stub(ConfirmRules, 'updateCompleteness').value(() => {})
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Confirm your operation meets the rules page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let request

    const checkCommonElements = async (doc) => {
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Confirm your operation meets the rules')
      Code.expect(doc.getElementById('standard-rule-code').firstChild.nodeValue).to.equal(mocks.standardRule.code)
      Code.expect(doc.getElementById('standard-rule-link').getAttribute('href')).to.equal(mocks.standardRule.guidanceUrl)
      Code.expect(doc.getElementById('rules-and-risk-hint').firstChild.nodeValue).to.exist()
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
        const doc = await GeneralTestHelper.getDoc(request)
        checkCommonElements(doc)

        GeneralTestHelper.checkElementsExist(doc, [
          'confirm-rules-paragraph-1',
          'operation-meets-rules-button'
        ])

        GeneralTestHelper.checkElementsDoNotExist(doc, [
          'confirm-result-message',
          'return-to-task-list-button'
        ])

        Code.expect(doc.getElementById('confirm-result-message')).to.not.exist()
        Code.expect(doc.getElementById('confirm-rules-paragraph-1')).to.exist()
        Code.expect(doc.getElementById('operation-meets-rules-button')).to.exist()
      })

      lab.test('when completed', async () => {
        ConfirmRules.isComplete = () => true
        const doc = await GeneralTestHelper.getDoc(request)
        checkCommonElements(doc)

        GeneralTestHelper.checkElementsExist(doc, [
          'confirm-result-message',
          'return-to-task-list-button'
        ])

        GeneralTestHelper.checkElementsDoNotExist(doc, [
          'confirm-rules-paragraph-1',
          'operation-meets-rules-button'
        ])
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when isComplete fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        ConfirmRules.isComplete = () => {
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
      lab.test('redirects to error screen when updateCompletenesss fails', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        ConfirmRules.updateCompleteness = () => {
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
