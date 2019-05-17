'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const TaskDeterminants = require('../../src/models/taskDeterminants.model')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const featureConfig = require('../../src/config/featureConfig')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/facility-type'
const nextRoutePath = '/select/bespoke'
const applyOfflinePath = '/facility-type/apply-offline'
const mcpPath = '/mcp-type'
const wastePath = '/waste-activity'

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(TaskDeterminants.prototype, 'save').value(() => undefined)
  // Todo: Remove hasBespokeFeature stub when bespoke is live
  sandbox.stub(featureConfig, 'hasBespokeFeature').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Facility Type page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({ excludeAlreadySubmittedTest: true })

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
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What type of facility do you want the permit for?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
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
      const facilityTypes = ['installation', 'waste', 'landfill', 'mcp', 'mining', 'discharge', 'groundwater']

      facilityTypes.forEach((facilityType) => {
        lab.test(`redirects to ${nextRoutePath}/${facilityType} when ${facilityType} is selected`, async () => {
          request.payload['facility-type'] = facilityType
          const res = await server.inject(request)
          Code.expect(res.statusCode).to.equal(302)
          switch (facilityType) {
            case 'mcp':
              Code.expect(res.headers['location']).to.equal(mcpPath)
              break
            case 'waste':
              Code.expect(res.headers['location']).to.equal(wastePath)
              break
            default:
              Code.expect(res.headers['location']).to.equal(applyOfflinePath)
              break
          }
        })
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when facility type not selected', async () => {
        request.payload = {}
        const doc = await GeneralTestHelper.getDoc(request)
        await GeneralTestHelper.checkValidationMessage(doc, 'facility-type', 'Select the type of facility you want')
      })
    })
  })
})
