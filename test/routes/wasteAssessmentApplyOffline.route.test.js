'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/persistence/entities/application.entity')
const RecoveryService = require('../../src/services/recovery.service')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const {
  WASTE_ASSESSMENT_APPLY_OFFLINE: {
    pageHeading,
    path: routePath
  }
} = require('../../src/routes')

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
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Waste Assessment Apply Offline tests', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookiePostTests: true
  })

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.test('success', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'change-selection-link',
        'how-to-apply',
        'bespoke-prefix',
        'bespoke-link',
        'bespoke-text'
      ])
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

    lab.experiment('checks', () => {
      lab.test('correctly displays empty list of permits', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)

        const values = Object
          .values(doc.getElementById('items').childNodes)
          .filter(({ firstChild }) => firstChild && firstChild.nodeValue)
          .map(({ firstChild }) => firstChild.nodeValue)

        Code.expect(values).to.be.empty()
      })
    })
  })
})
