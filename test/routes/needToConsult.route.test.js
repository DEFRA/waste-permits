'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const CharityDetail = require('../../src/models/charityDetail.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const NeedToConsult = require('../../src/models/needToConsult.model')

const routePath = '/consultation/names'
const nextRoutePath = '/task-list'
const errorPath = '/errors/technical-problem'

let sandbox
let mocks

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Will the operation release any substance into a sewer, harbour or coastal or territorial waters?')
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'consult-sewer-required',
    'consult-sewer-required-label',
    'consult-sewerage-undertaker',
    'consult-sewerage-undertaker-label',
    'consult-harbour-required',
    'consult-harbour-required-label',
    'consult-harbour-authority',
    'consult-harbour-authority-label',
    'consult-fisheries-required',
    'consult-fisheries-required-label',
    'consult-fisheries-committee',
    'consult-fisheries-committee-label',
    'consult-none-required',
    'consult-none-required-label'
  ])
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').callsFake(async () => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(CharityDetail, 'get').value(() => undefined)
  sandbox.stub(NeedToConsult, 'get').callsFake(async () => mocks.needToConsult)
  sandbox.stub(NeedToConsult.prototype, 'save').callsFake(async () => null)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Consultees page tests:', () => {
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

    lab.experiment('success', () => {
      lab.test('when first time', async () => {
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
      })
      lab.test('when value already selected', async () => {
        mocks.needToConsult.none = true
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
      })
      lab.test('when all data already entered', async () => {
        mocks.needToConsult.sewer = true
        mocks.needToConsult.sewerageUndertaker = 'SEWERAGE UNDERTAKER'
        mocks.needToConsult.harbour = true
        mocks.needToConsult.harbourAuthority = 'HARBOUR AUTHORITY'
        mocks.needToConsult.fisheries = true
        mocks.needToConsult.fisheriesCommittee = 'FISHERIES COMMITTEE'
        mocks.needToConsult.none = false
        const doc = await GeneralTestHelper.getDoc(request)
        await checkCommonElements(doc)
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
          'consult-sewer-required': 'yes',
          'consult-sewerage-undertaker': 'SEWERAGE UNDERTAKER',
          'consult-harbour-required': 'yes',
          'consult-harbour-authority': 'HARBOUR AUTHORITY',
          'consult-fisheries-required': 'yes',
          'consult-fisheries-committee': 'FISHERIES COMMITTEE'
        }
      }
    })

    lab.experiment('success', async () => {
      lab.test('when all selected', async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when none selected', async () => {
        postRequest.payload = { 'consult-none-required': 'yes' }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('when each selected', async () => {
        let res
        postRequest.payload = { 'consult-sewer-required': 'yes', 'consult-sewerage-undertaker': 'SEWERAGE UNDERTAKER' }
        res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
        postRequest.payload = { 'consult-harbour-required': 'yes', 'consult-harbour-authority': 'HARBOUR AUTHORITY' }
        res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
        postRequest.payload = { 'consult-fisheries-required': 'yes', 'consult-fisheries-committee': 'FISHERIES COMMITTEE' }
        res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when no values selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-select', `Select at least one option. If there are no releases select 'None of these'.`)
      })
      lab.test(`when both releases and 'None' are selected`, async () => {
        postRequest.payload['consult-none-required'] = 'yes'
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-select', `You cannot select a release and 'None of these'. Please deselect one of them.`)
      })
      lab.test(`when both releases and 'None' are selected, only shows single error message`, async () => {
        postRequest.payload['consult-none-required'] = 'yes'
        delete postRequest.payload['consult-sewerage-undertaker']
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-select', `You cannot select a release and 'None of these'. Please deselect one of them.`)
        await GeneralTestHelper.checkValidationMessageCount(doc, 1)
        await GeneralTestHelper.checkNoValidationMessage(doc, 'consult-sewerage-undertaker')
      })
      lab.test('when sewer is selected but no undertaker name is provided', async () => {
        delete postRequest.payload['consult-sewerage-undertaker']
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-sewerage-undertaker', 'Enter the water or sewerage company name')
      })
      lab.test('when harbour is selected but no authority name is provided', async () => {
        delete postRequest.payload['consult-harbour-authority']
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-harbour-authority', 'Enter the harbour authority name')
      })
      lab.test('when fisheries is selected but no committee name is provided', async () => {
        delete postRequest.payload['consult-fisheries-committee']
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-fisheries-committee', 'Enter the fisheries committee name')
      })
      lab.test('when sewerage undertaker name is too long', async () => {
        postRequest.payload['consult-sewerage-undertaker'] = 'X'.repeat(151)
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-sewerage-undertaker', 'Enter fewer than 150 characters in water or sewerage company name')
      })
      lab.test('when harbour authority name is too long', async () => {
        postRequest.payload['consult-harbour-authority'] = 'X'.repeat(151)
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-harbour-authority', 'Enter fewer than 150 characters in harbour authority name')
      })
      lab.test('when fisheries committee name is too long', async () => {
        postRequest.payload['consult-fisheries-committee'] = 'X'.repeat(151)
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await checkCommonElements(doc)
        await GeneralTestHelper.checkValidationMessage(doc, 'consult-fisheries-committee', 'Enter fewer than 150 characters in fisheries committee name')
      })
    })
  })
})
