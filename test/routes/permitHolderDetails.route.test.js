'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

const routePath = '/permit-holder/details'
const companyNumberPath = '/permit-holder/company/number'
const permitHolderName = '/permit-holder/name'

let fakeApplication
let fakePermitHolder
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationName: 'APPLICATION_NAME'
  }

  fakePermitHolder = {
    id: 'individual'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub cookies
  GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
    'permitHolderType': () => fakePermitHolder
  })

  // Stub methods
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Payment, 'getBacsPayment').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Permit holder details: Redirect to correct details flow', () => {
  new GeneralTestHelper(lab, routePath).test({excludeCookiePostTests: true, excludeHtmlTests: true})

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
        fakePermitHolder.id = 'limited-company'

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(companyNumberPath)
      })

      lab.test('redirects to permit holder name screen if permit holder type is individual', async () => {
        fakePermitHolder.id = 'individual'

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(permitHolderName)
      })
    })
  })
})
