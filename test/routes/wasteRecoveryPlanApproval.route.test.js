'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/waste-recovery-plan/approval'
const nextRoutePath = '/waste-recovery-plan'
const errorPath = '/errors/technical-problem'

const ALREADY_ASSESSED = 910400000
const PLAN_HAS_CHANGED = 910400001
const NOT_ASSESSED = 910400002

let getRequest
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Waste Recovery Plan Approval page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    lab.experiment('success', () => {
      const checkCommonElements = (doc) => {
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('You need to upload your waste recovery plan')
        Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

        GeneralTestHelper.checkElementsExist(doc, [
          'defra-csrf-token',
          'recovery-plan-paragraph-1',
          'recovery-plan-paragraph-2',
          'recovery-plan-guidence-link',
          'selection-hint-text',
          'selection',
          'selection-yes-input',
          'selection-yes-label',
          'selection-yes-label-text',
          'selection-no-input',
          'selection-no-label',
          'selection-no-label-text',
          'selection-changed-input',
          'selection-changed-label',
          'selection-changed-label-text',
          'selection-changed-hint'
        ])

        Code.expect(doc.getElementById('selection-yes-input').getAttribute('value')).to.equal(ALREADY_ASSESSED.toString())
        Code.expect(doc.getElementById('selection-no-input').getAttribute('value')).to.equal(NOT_ASSESSED.toString())
        Code.expect(doc.getElementById('selection-changed-input').getAttribute('value')).to.equal(PLAN_HAS_CHANGED.toString())
      }

      lab.test(`The page should load correctly when nothing is selected`, async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
      })

      lab.test(`The page should load correctly when already assessed is selected`, async () => {
        mocks.application.recoveryPlanAssessmentStatus = ALREADY_ASSESSED
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('selection-yes-input').getAttribute('checked')).to.equal('checked')
        Code.expect(doc.getElementById('selection-no-input').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('selection-changed-input').getAttribute('checked')).to.equal('')
      })

      lab.test(`The page should load correctly when not assessed is selected`, async () => {
        mocks.application.recoveryPlanAssessmentStatus = NOT_ASSESSED
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('selection-yes-input').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('selection-no-input').getAttribute('checked')).to.equal('checked')
        Code.expect(doc.getElementById('selection-changed-input').getAttribute('checked')).to.equal('')
      })

      lab.test(`The page should load correctly when plan has changed is selected`, async () => {
        mocks.application.recoveryPlanAssessmentStatus = PLAN_HAS_CHANGED
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('selection-yes-input').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('selection-no-input').getAttribute('checked')).to.equal('')
        Code.expect(doc.getElementById('selection-changed-input').getAttribute('checked')).to.equal('checked')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(getRequest)
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
        payload: {
          selection: ALREADY_ASSESSED
        }
      }
    })

    lab.test('success', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })

    lab.experiment('invalid', () => {
      lab.test('when no assessment status has been selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'selection', 'Tell us if we have assessed your waste recovery plan')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
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
