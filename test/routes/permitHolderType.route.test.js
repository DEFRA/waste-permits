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
const LoggingService = require('../../src/services/logging.service')
const PermitHolderTypeController = require('../../src/controllers/permitHolderType.controller')
const {COOKIE_RESULT} = require('../../src/constants')

const routePath = '/permit-holder/type'
const nextRoutePath = '/permit/category'
const offlineRoutePath = '/start/apply-offline'
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakePermitHolderType
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationName: 'APPLICATION_NAME'
  }

  fakePermitHolderType = {
    id: 'PERMIT_HOLDER_TYPE_ID',
    type: 'PERMIT_HOLDER_TYPE',
    canApplyOnline: true
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  // sandbox.stub(CookieService, 'set').value(() => () => {})
  sandbox.stub(server, 'log').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Permit holder type: Who will be the permit holder? page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Who will be the permit holder?')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

    GeneralTestHelper.checkElementsExist(doc, ['helpline-text'])
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
      let holderTypes = [
        {id: 'limited-company', type: 'Limited company', canApplyOnline: true},
        {id: 'individual', type: 'Individual or sole trader', canApplyOnline: false},
        {id: 'local-authority', type: 'Local authority or public body', canApplyOnline: false},
        {id: 'partnership', type: 'Partnership', canApplyOnline: false},
        {id: 'registered-charity', type: 'Registered charity', canApplyOnline: false},
        {id: 'limited-liability-partnership', type: 'Limited liability partnership', canApplyOnline: false},
        {id: 'other-organisation', type: 'Other organisation, for example a club or association', canApplyOnline: false}
      ]

      holderTypes.forEach(({id, type}) => {
        lab.test(`should include option for ${type}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          checkCommonElements(doc)
          const prefix = `chosen-holder-${id}`
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(id)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-type`).firstChild.nodeValue.trim()).to.equal(type)
        })
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
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

    lab.experiment('success', () => {
      const checkRoute = async (route) => {
        const setCookieSpy = sandbox.spy(CookieService, 'set')
        postRequest.payload['chosen-holder-type'] = fakePermitHolderType.id
        const res = await server.inject(postRequest)

        // Make sure standard rule type is saved in a cookie
        Code.expect(setCookieSpy.calledOnce).to.equal(true)
        Code.expect(setCookieSpy.calledWith(res.request, 'permitHolderType', fakePermitHolderType)).to.equal(true)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(route)
      }

      lab.beforeEach(() => {
        sandbox.stub(PermitHolderTypeController, 'getHolderTypes').value(() => [fakePermitHolderType])
      })

      lab.test('when holder type can apply online', async () => {
        await checkRoute(nextRoutePath)
      })

      lab.test('when holder type cannot apply online', async () => {
        fakePermitHolderType.canApplyOnline = false
        await checkRoute(offlineRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when type not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'chosen-holder-type', 'Select who will be the permit holder')
      })
    })
  })
})
