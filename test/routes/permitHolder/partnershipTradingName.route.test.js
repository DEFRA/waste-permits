'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const Application = require('../../../src/persistence/entities/application.entity')
const Account = require('../../../src/persistence/entities/account.entity')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/permit-holder/partners/trading-name'
const nextRoutePath = '/permit-holder/partners/list'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(Account.prototype, 'save').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Partnership Trading Name page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What name do you use for the partnership?')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'paragraph-1',
      'paragraph-2',
      'paragraph-3',
      'paragraph-4',
      'trading-name-label'
    ])
  }

  lab.experiment('GET:', () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('The page should have a back link', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)

        const element = doc.getElementById('back-link')
        Code.expect(element).to.exist()
      })

      lab.test('returns the contact page on first load correctly', async () => {
        delete mocks.application.tradingName
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('trading-name').getAttribute('value')).to.equal('')
      })

      lab.test(`returns the contact page correctly when trading name has already been entered previously`, async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('trading-name').getAttribute('value')).to.equal(mocks.application.tradingName)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })

  lab.experiment('POST:', () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('when trade name is entered', async () => {
        postRequest.payload = {
          'trading-name': 'TRADING_NAME'
        }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when trade name has not been entered', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'trading-name', 'Enter a name for the partnership')
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })
})
