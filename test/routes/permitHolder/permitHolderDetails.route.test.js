'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const RecoveryService = require('../../../src/services/recovery.service')
const CookieService = require('../../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/permit-holder/details'
const companyNumberPath = '/permit-holder/company/number'
const permitHolderName = '/permit-holder/name'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Permit holder details: Redirect to correct details flow', () => {
  new GeneralTestHelper({ lab, routePath }).test({ excludeCookiePostTests: true, excludeHtmlTests: true })

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('redirects to company number screen if permit holder type is company', async () => {
        mocks.application.applicantType = 910400001
        mocks.application.organisationType = 910400000

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(companyNumberPath)
      })

      lab.test('redirects to permit holder name screen if permit holder type is individual', async () => {
        mocks.application.applicantType = 910400000
        mocks.permitHolderType.type = 'Individual'

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(permitHolderName)
      })
    })
  })
})
