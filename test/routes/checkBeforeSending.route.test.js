'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/models/application.model')
const ApplicationLine = require('../../src/models/applicationLine.model')
const LoggingService = require('../../src/services/logging.service')
const BaseCheck = require('../../src/models/checkYourAnswers/base.check')
const CheckBeforeSendingController = require('../../src/controllers/checkBeforeSending.controller')
const CookieService = require('../../src/services/cookie.service')

let fakeApplicationId = 'APPLICATION_ID'
let fakeApplication
let fakeValidRulesetId
let fakeInvalidRulesetId
let fakeLineData

const routePath = '/check-before-sending'
const nextRoutePath = '/done'
const notCompleteRoutePath = '/errors/order/task-list-not-complete'

let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: fakeApplicationId,
    declaration: true
  }

  fakeValidRulesetId = 'TEST_RULESETID'
  fakeInvalidRulesetId = 'TEST_INVALID_RULESETID'
  fakeLineData = {
    heading: 'TEST',
    answers: ['test1', 'test2'],
    links: [
      {path: '/test-1', type: 'test details 1'},
      {path: '/test-2', type: 'test details 2'}
    ]
  }

  // Should be included in page
  class ValidCheck extends BaseCheck {
    static get rulesetId () {
      return fakeValidRulesetId
    }

    get prefix () {
      return `${super.prefix}-test`
    }

    async buildLines () {
      return [this.buildLine(fakeLineData)]
    }
  }

  // Should not be included in page
  class InvalidCheck extends BaseCheck {
    static get rulesetId () {
      return fakeInvalidRulesetId
    }
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => true)
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(ApplicationLine, 'getValidRulesetIds').value(() => [fakeValidRulesetId])
  sandbox.stub(CheckBeforeSendingController.prototype, 'Checks').get(() => [ValidCheck, InvalidCheck])
  sandbox.stub(Application.prototype, 'isComplete').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Check your answers before sending your application page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(true, true, true)

  lab.experiment(`GET ${routePath}`, () => {
    let request
    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('The page should have a back link', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('back-link')).to.exist()
    })

    lab.test('returns the check before sending page correctly', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Check your answers before sending your application')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Confirm and pay')

      const {heading, answers, links} = fakeLineData
      Code.expect(doc.getElementById('section-test-heading').firstChild.nodeValue.trim()).to.equal(heading)
      answers.forEach((answer, index) => {
        Code.expect(doc.getElementById(`section-test-answer-${index + 1}`).firstChild.nodeValue.trim()).to.equal(answers[index])
      })
      links.forEach((answer, index) => {
        const id = `section-test-link-${index + 1}`
        const {path, type} = links[index]
        Code.expect(doc.getElementById(id).getAttribute('href')).to.equal(path)
        Code.expect(doc.getElementById(id).firstChild.nodeValue.trim()).to.equal('Change')
        Code.expect(doc.getElementById(`${id}-type`).firstChild.nodeValue.trim()).to.equal(type)
      })
    })

    lab.test('Redirects to the Not Complete screen if the application has not been completed', async () => {
      Application.prototype.isComplete = () => false

      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(notCompleteRoutePath)
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let request
    lab.beforeEach(() => {
      request = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('redirects to the Application Received route after an UPDATE', async () => {
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })
  })
})
