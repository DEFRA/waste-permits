'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/persistence/entities/application.entity')
const BaseTaskList = require('../../src/models/taskList/base.taskList')
const BaseCheck = require('../../src/models/checkList/base.check')
const CheckList = require('../../src/models/checkList/checkList')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const UploadService = require('../../src/services/upload.service')

let fakeValidRuleSetId
let fakeInvalidRuleSetId
let fakeLineData
let fakePermitHeadingLine
let fakeContactHeadingLine

const routePath = '/check-before-sending'
const nextRoutePath = '/pay/type'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  fakeValidRuleSetId = 'TEST_RULESETID'
  fakeInvalidRuleSetId = 'TEST_INVALID_RULESETID'
  fakeLineData = {
    heading: 'TEST',
    answers: ['test1', 'test2'],
    links: [
      { path: '/test-1', type: 'test details 1' },
      { path: '/test-2', type: 'test details 2' }
    ]
  }
  fakePermitHeadingLine = {
    heading: 'TESTB',
    headingId: 'section-permit-heading',
    answers: [],
    links: []
  }
  fakeContactHeadingLine = {
    heading: 'Contact',
    headingId: 'section-contact-name-heading',
    answers: [],
    links: []
  }

  class TaskList extends BaseTaskList {
    async isAvailable (task = {}) {
      return task.ruleSetId === fakeValidRuleSetId
    }
  }

  // Should be included in page
  class ValidCheck extends BaseCheck {
    static get task () {
      return { ruleSetId: fakeValidRuleSetId }
    }

    get prefix () {
      return `${super.prefix}-test`
    }

    async buildLines () {
      return [
        this.buildLine(fakeLineData),
        fakePermitHeadingLine,
        fakeContactHeadingLine
      ]
    }
  }

  // Should not be included in page
  class InvalidCheck extends BaseCheck {
    static get task () {
      return { ruleSetId: fakeInvalidRuleSetId }
    }
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => true)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(UploadService, 'upload').value(() => undefined)
  sandbox.stub(CheckList.prototype, 'Checks').get(() => [ValidCheck, InvalidCheck])
  sandbox.stub(BaseTaskList, 'getTaskListClass').value(() => TaskList)
  sandbox.stub(BaseTaskList, 'buildTaskList').value(() => new TaskList())
  sandbox.stub(BaseTaskList, 'isComplete').value(() => true)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Check your answers before sending your application page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true
  })

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
      const doc = await GeneralTestHelper.getDoc(request)

      Code.expect(doc.getElementById('back-link')).to.exist()
    })

    lab.test('returns the check before sending page static content correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(request)

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Check your answers')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Confirm and continue')
      Code.expect(doc.getElementById('privacy-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/environmental-permits-privacy-notice')

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'declaration-warning-heading',
        'declaration-warning-notice-hidden',
        'declaration-warning-notice-content',
        'declaration-confirmation-list-heading',
        'declaration-confirmation-list-item-1',
        'declaration-confirmation-list-item-2',
        'declaration-confirmation-list-item-3',
        'managment-system-link',
        'managment-system-link-text',
        'print-page-hint'
      ])
    })

    lab.test('returns the check before sending page dynamic content correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(request)

      const { heading, answers, links } = fakeLineData
      Code.expect(doc.getElementById('section-test-heading').firstChild.nodeValue.trim()).to.equal(heading)
      answers.forEach((answer, index) => {
        Code.expect(doc.getElementById(`section-test-answer-${index + 1}`).firstChild.nodeValue.trim()).to.equal(answers[index])
      })
      links.forEach((answer, index) => {
        const id = `section-test-link-${index + 1}`
        const { path, type } = links[index]
        Code.expect(doc.getElementById(id).getAttribute('href')).to.equal(path)
        Code.expect(doc.getElementById(id).firstChild.nodeValue.trim()).to.equal('Change')
        Code.expect(doc.getElementById(`${id}-type`).firstChild.nodeValue.trim()).to.equal(type)
      })
    })
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
      Code.expect(res.headers.location).to.equal(nextRoutePath)
    })
  })
})
