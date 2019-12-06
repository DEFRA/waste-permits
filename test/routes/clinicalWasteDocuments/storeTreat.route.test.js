'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const StandardRule = require('../../../src/persistence/entities/standardRule.entity')
const CookieService = require('../../../src/services/cookie.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')
const TaskDeterminants = require('../../../src/models/taskDeterminants.model')

const StoreTreat = require('../../../src/models/storeTreat.model')

const routePath = '/clinical-waste-documents/store-treat-waste-type'
const yesRoutePath = '/clinical-waste-documents/justification/upload'
const noRoutePath = '/clinical-waste-documents/summary/upload'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(StoreTreat, 'get').callsFake(async () => mocks.storeTreat)
  sandbox.stub(StoreTreat.prototype, 'save').callsFake(async () => undefined)

  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(TaskDeterminants, 'get').value(() => mocks.taskDeterminants)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Clinical waste documents - store or treat waste types:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('Check the basics', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Will you store or treat a waste type not permitted in EPR 5.07?')
      Code.expect(doc.getElementById('back-link')).to.exist()
      Code.expect(doc.getElementById('store-treat-description')).to.exist()
      Code.expect(doc.getElementById('store-treat-legend')).to.exist()
      Code.expect(doc.getElementById('store-treat-no')).to.exist()
      Code.expect(doc.getElementById('store-treat-no-label')).to.exist()
      Code.expect(doc.getElementById('store-treat-yes')).to.exist()
      Code.expect(doc.getElementById('store-treat-yes-label')).to.exist()
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
          'store-treat': 'yes'
        }
      }
    })

    lab.test('Success - yes', async () => {
      // Choose 'Yes' and click 'Continue'
      postRequest.payload['store-treat'] = 'yes'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(yesRoutePath)
    })

    lab.test('Success - no', async () => {
      // Choose 'No' and click 'Continue'
      postRequest.payload['store-treat'] = 'no'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(noRoutePath)
    })

    lab.test('Invalid input', async () => {
      // Choose nothing and click 'Continue' (hence an empty payload)
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await GeneralTestHelper.checkValidationMessage(doc, 'store-treat', 'Select yes or no')
    })
  })
})
