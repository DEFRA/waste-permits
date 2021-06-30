'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const BaseController = require('../../../src/controllers/base.controller')
const CookieService = require('../../../src/services/cookie.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')
const ClimateChangeRiskScreening = require('../../../src/models/taskList/climateChangeRiskScreening.task')
const ClimateChangeRiskScreeningModel = require('../../../src/models/climateChangeRiskScreening.model')

const {
  CLIMATE_CHANGE_RISK_SCREENING_PERMIT_LENGTH,
  CLIMATE_CHANGE_RISK_SCREENING_FLOOD_RISK,
  TASK_LIST
} = require('../../../src/routes')

const routePath = CLIMATE_CHANGE_RISK_SCREENING_PERMIT_LENGTH.path
const nextRoutePath = CLIMATE_CHANGE_RISK_SCREENING_FLOOD_RISK.path

let sandbox
let mocks

const checkCommonElements = async (doc) => {
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'permit-length-summary',
    'permit-length-visually-hidden',
    'less-than-5',
    'between-2020-and-2040',
    'until-2060-or-beyond'
  ])
}

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(BaseController.prototype, 'createPageContext').returns({})
  sandbox.stub(ClimateChangeRiskScreeningModel, 'get').value(() => mocks.climateChangeRiskScreening)
  sandbox.stub(ClimateChangeRiskScreening, 'updateCompleteness').value(() => {})
  sandbox.stub(ClimateChangeRiskScreeningModel.prototype, 'save').callsFake(async () => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Climate change - permit length tests:', () => {
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

    lab.test('Page successfully loads', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
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

    lab.test(`When 'Less than 5 years' selected - redirects to ${TASK_LIST.path}`, async () => {
      postRequest.payload = { 'permit-length': 'less-than-5' }

      const res = await server.inject(postRequest)

      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(TASK_LIST.path)
    })

    lab.test(`When any other option selected - redirects to ${nextRoutePath}`, async () => {
      postRequest.payload = { 'permit-length': 'between-2020-and-2040' }

      const res = await server.inject(postRequest)

      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRoutePath)
    })
  })
})
