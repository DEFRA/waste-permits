'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const StandardRuleType = require('../../src/models/standardRuleType.model')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../src/constants')

const routePath = '/start/apply-offline'
const errorPath = '/errors/technical-problem'
const startPath = '/errors/order/start-at-beginning'

let fakeApplication
let fakePermitHolderType
let fakeStandardRuleTypeId
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakeStandardRuleTypeId = 'offline-category-flood'
  fakePermitHolderType = {canApplyOnline: false}

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Save for use in stub
  const cookieGet = CookieService.get

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(StandardRuleType, 'getCategories').value(() => [])
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(CookieService, 'get').value((request, cookieKey) => {
    switch (cookieKey) {
      case 'permitHolderType':
        return fakePermitHolderType
      case 'standardRuleTypeId':
        return fakeStandardRuleTypeId
      default:
        return cookieGet(request, cookieKey)
    }
  })
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Apply Offline: Download and fill in these forms to apply for that permit page tests:', () => {
  new GeneralTestHelper(lab, routePath).test({excludeCookiePostTests: true})

  const getDoc = async (request) => {
    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    return parser.parseFromString(res.payload, 'text/html')
  }

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Download and fill in these forms to apply for that permit')
    Code.expect(doc.getElementById('submit-button')).to.not.exist()

    GeneralTestHelper.checkElementsExist(doc, [
      'standard-rules-waste-permit-forms-link',
      'flood-risk-activities-standard-rules-permit-forms-link',
      'water-discharge-permit-forms-link',
      'radioactive-substances-regulation-for-non-nuclear-sites-guidance-link'
    ])
  }

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
      lab.test('should include categories ', async () => {
        const doc = await getDoc(getRequest)
        checkCommonElements(doc)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to start screen when cookie does not contain an offline category id and the permit holder can apply online', async () => {
        fakeStandardRuleTypeId = undefined
        fakePermitHolderType.canApplyOnline = true
        const spy = sinon.spy(LoggingService, 'logError')

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(startPath)
      })
    })
  })
})
