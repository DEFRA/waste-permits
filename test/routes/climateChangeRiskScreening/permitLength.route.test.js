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
  CLIMATE_CHANGE_RISK_SCREENING_UPLOAD,
  CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD,
  TASK_LIST } = require('../../../src/routes')

const routePath = CLIMATE_CHANGE_RISK_SCREENING_PERMIT_LENGTH.path
const nextRoutePath = CLIMATE_CHANGE_RISK_SCREENING_FLOOD_RISK.path

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(ClimateChangeRiskScreeningModel, 'get').value(() => mocks.climateChangeRiskScreening)
  sandbox.stub(ClimateChangeRiskScreening, 'updateCompleteness').value(() => {})
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

    lab.test('Redirects to upload page when options leading to upload previously selected', async () => {
      sandbox.stub(ClimateChangeRiskScreeningModel, 'isUploadRequired').resolves(true)
      sandbox.stub(ClimateChangeRiskScreeningModel, 'isPermitLengthLessThan5').resolves(false)
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(CLIMATE_CHANGE_RISK_SCREENING_UPLOAD.path)
    })

    lab.test('Redirects to no upload page when options leading to no upload previously selected', async () => {
      sandbox.stub(ClimateChangeRiskScreeningModel, 'isUploadRequired').resolves(false)
      sandbox.stub(ClimateChangeRiskScreeningModel, 'isPermitLengthLessThan5').resolves(false)
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(CLIMATE_CHANGE_RISK_SCREENING_NO_UPLOAD.path)
    })

    lab.test('Displays page when "less than 5 years" option previously selected', async () => {
      sandbox.stub(ClimateChangeRiskScreeningModel, 'isUploadRequired').resolves(undefined)
      sandbox.stub(ClimateChangeRiskScreeningModel, 'isPermitLengthLessThan5').resolves(true)
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(200)
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
      postRequest.payload['permit-length'] = 'less-than-5'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(TASK_LIST.path)
    })

    lab.test(`When any other option selected - redirects to ${nextRoutePath}`, async () => {
      postRequest.payload['permit-length'] = 'between-2020-and-2040'
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePath)
    })
  })
})
