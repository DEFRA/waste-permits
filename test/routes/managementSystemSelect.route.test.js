'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const ApplicationAnswer = require('../../src/persistence/entities/applicationAnswer.entity')
const LoggingService = require('../../src/services/logging.service')
const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const ManagementSystemSelectController = require('../../src/controllers/managementSystemSelect.controller')

const { MANAGEMENT_SYSTEM } = require('../../src/dynamics').ApplicationQuestions
const { questionCode } = MANAGEMENT_SYSTEM

const routePath = '/management-system/select'
const nextRoutePath = '/management-system/upload'
const errorPath = '/errors/technical-problem'

let sandbox
let mocks

const checkCommonElements = (doc) => {
  const pageHeading = 'Which management system will you use?'
  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
  Code.expect(doc.getElementById(`${questionCode}-legend`).firstChild.nodeValue).to.equal(pageHeading)

  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  MANAGEMENT_SYSTEM.answers.forEach(({ id }) => {
    Code.expect(doc.getElementById(id).getAttribute('value')).to.equal(id)
  })

  Code.expect(doc.getElementById(`${questionCode}-message`)).to.exist()
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationAnswer, 'getByQuestionCode').value(() => mocks.applicationAnswers)
  sandbox.stub(ApplicationAnswer.prototype, 'save').value(() => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Management system select tests:', () => {
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
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest
    let managementSystem

    lab.beforeEach(() => {
      managementSystem = MANAGEMENT_SYSTEM.answers[0]
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          [questionCode]: managementSystem.id
        }
      }
    })

    lab.experiment('success', async () => {
      MANAGEMENT_SYSTEM.answers.forEach(({ id, description }) => {
        lab.test(`when ${description} selected`, async () => {
          postRequest.payload[questionCode] = id
          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when management system not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('error-summary-list-item-0').firstChild.nodeValue).to.equal('Select the management system you will use')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when an unknown management system is selected', async () => {
        postRequest.payload[questionCode] = 'UNKNOWN'
        const spy = sandbox.spy(LoggingService, 'logError')

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment('Build description template', async () => {
    lab.test('with ISO abbreviation', async () => {
      const description = await ManagementSystemSelectController._buildDescription('<div>{{{ISO}}}</div>', 'ID')
      Code.expect(description).to.equal('<div><abbr id="ID" title="International Organization of Standardization">ISO</abbr></div>')
    })

    lab.test('with EMAS abbreviation', async () => {
      const description = await ManagementSystemSelectController._buildDescription('<div>{{{EMAS}}}</div>', 'ID')
      Code.expect(description).to.equal('<div><abbr id="ID" title="Eco-Management and Audit Scheme">EMAS</abbr></div>')
    })
  })
})
