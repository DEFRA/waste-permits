'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const ConfirmRules = require('../../src/models/confirmRules.model')
const LoggingService = require('../../src/services/logging.service')
const Constants = require('../../src/constants')

let validateCookieStub
let confirmRulesSaveStub
let getByApplicationIdStub
let logErrorStub
let fakeConfirmRules

const routePath = '/confirm-rules'

lab.beforeEach(() => {
  fakeConfirmRules = {
    applicationId: '403710b7-18b8-e711-810d-5065f38bb461',
    applicationLineId: '423710b7-18b8-e711-810d-5065f38bb461'
  }
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  getByApplicationIdStub = ConfirmRules.getByApplicationId
  ConfirmRules.getByApplicationId = () => fakeConfirmRules
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
})

lab.experiment('Confirm that your operation meets the rules page tests:', () => {
  lab.experiment('GET /confirm-rules', () => {
    let doc
    let getRequest

    const getDoc = async () => {
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Confirm your operation meets the rules')
      Code.expect(doc.getElementById('confirm-rules-paragraph-1')).to.exist()
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

        Code.expect(doc.getElementById('confirm-result-message')).to.not.exist()
        Code.expect(doc.getElementById('return-to-task-list-button')).to.not.exist()
        Code.expect(doc.getElementById('operation-meets-rules-button').firstChild.nodeValue).to.equal('Our operation meets these rules')
      })

      lab.test('when complete', async () => {
        fakeConfirmRules.complete = true
        doc = await getDoc()

        Code.expect(doc.getElementById('confirm-result-message')).to.exist()
        Code.expect(doc.getElementById('return-to-task-list-button').firstChild.nodeValue).to.equal('Return to task list')
        Code.expect(doc.getElementById('operation-meets-rules-button')).to.not.exist()
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => undefined

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        ConfirmRules.getByApplicationId = () => undefined

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
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
      ConfirmRules.getByApplicationId = getByApplicationIdStub
    })

    lab.experiment('success', () => {
      lab.test('when incomplete', async () => {
        ConfirmRules.getByApplicationId = () => ({complete: false})

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/confirm-rules')
      })

      lab.test('when complete', async () => {
        ConfirmRules.getByApplicationId = () => ({complete: true})

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/task-list')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when the user token is invalid', async () => {
        CookieService.validateCookie = () => undefined

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        ConfirmRules.getByApplicationId = () => Promise.reject(new Error('read failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })

      lab.test('redirects to error screen when save fails', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        ConfirmRules.prototype.save = () => Promise.reject(new Error('save failed'))

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/error')
      })
    })
  })
})
