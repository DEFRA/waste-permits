'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const CookieService = require('../../src/services/cookie.service')
const ConfirmRules = require('../../src/models/confirmRules.model')
const StandardRule = require('../../src/models/standardRule.model')
const LoggingService = require('../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../src/constants')

let validateCookieStub
let confirmRulesSaveStub
let getByApplicationIdStub
let getByApplicationLineIdStub
let applicationGetByIdStub
let applicationIsSubmittedStub
let logErrorStub

let fakeApplication
let fakeConfirmRules
let fakeStandardRule

const routePath = '/confirm-rules'
const errorPath = '/errors/technical-problem'

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationName: 'APPLICATION_NAME'
  }

  fakeConfirmRules = {
    applicationId: 'APPLICATION_ID',
    applicationLineId: 'APPLICATION_LINE_ID'
  }

  fakeStandardRule = {
    applicationLineId: 'APPLICATION_LINE_ID'
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  getByApplicationIdStub = ConfirmRules.getByApplicationId
  ConfirmRules.getByApplicationId = () => fakeConfirmRules

  getByApplicationLineIdStub = StandardRule.getByApplicationLineId
  StandardRule.getByApplicationLineId = () => fakeStandardRule

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplication)

  applicationIsSubmittedStub = Application.prototype.isSubmitted
  Application.prototype.isSubmitted = () => false
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  ConfirmRules.getByApplicationId = getByApplicationIdStub
  StandardRule.getByApplicationLineId = getByApplicationLineIdStub
  Application.getById = applicationGetByIdStub
  Application.prototype.isSubmitted = applicationIsSubmittedStub
})

lab.experiment('Confirm that your operation meets the rules page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`GET ${routePath}`, () => {
    let doc
    let getRequest

    const getDoc = async () => {
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Confirm your operation meets the rules')
      Code.expect(doc.getElementById('rules-and-risk-hint')).to.exist()
      return doc
    }

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }

      confirmRulesSaveStub = ConfirmRules.prototype.save
      ConfirmRules.prototype.save = () => {}
    })

    lab.test('should have a back link', async () => {
      const doc = await getDoc()
      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })

    lab.experiment('success', () => {
      lab.test('when incomplete', async () => {
        doc = await getDoc()

        Code.expect(doc.getElementById('confirm-rules-paragraph-1')).to.exist()
        Code.expect(doc.getElementById('confirm-result-message')).to.not.exist()
        Code.expect(doc.getElementById('return-to-task-list-button')).to.not.exist()
        Code.expect(doc.getElementById('operation-meets-rules-button').firstChild.nodeValue).to.equal('Our operation meets these rules')
      })

      lab.test('when complete', async () => {
        fakeConfirmRules.complete = true
        doc = await getDoc()

        Code.expect(doc.getElementById('confirm-rules-paragraph-1')).to.not.exist()
        Code.expect(doc.getElementById('confirm-result-message')).to.exist()
        Code.expect(doc.getElementById('return-to-task-list-button').firstChild.nodeValue).to.equal('Return to task list')
        Code.expect(doc.getElementById('operation-meets-rules-button')).to.not.exist()
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        ConfirmRules.getByApplicationId = () => undefined

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment('POST /confirm-rules', () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }

      confirmRulesSaveStub = ConfirmRules.prototype.save
      ConfirmRules.prototype.save = () => {}
    })

    lab.afterEach(() => {
      // Restore stubbed methods
      ConfirmRules.prototype.save = confirmRulesSaveStub
    })

    lab.experiment('success', () => {
      lab.test('when incomplete', async () => {
        ConfirmRules.getByApplicationId = () => ({complete: false})

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/task-list')
      })

      lab.test('when complete', async () => {
        ConfirmRules.getByApplicationId = () => ({complete: true})

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/task-list')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        ConfirmRules.getByApplicationId = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        ConfirmRules.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
