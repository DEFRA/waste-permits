'use strict'

const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../../routes/generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const CryptoService = require('../../../src/services/crypto.service')
const RecoveryService = require('../../../src/services/recovery.service')
const Address = require('../../../src/persistence/entities/address.entity')
const Application = require('../../../src/persistence/entities/application.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const { COOKIE_RESULT } = require('../../../src/constants')

const postcode = 'BS1 4AH'

module.exports = (lab, { routePath, nextRoutePath, pageHeading, TaskModel, PostCodeCookie, contactDetailId }) => {
  let sandbox
  let getRequest
  let postRequest
  let mocks

  lab.beforeEach(() => {
    mocks = new Mocks()

    getRequest = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    postRequest = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    }

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub cookies
    GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
      [PostCodeCookie]: () => postcode
    })

    // Stub methods
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
    sandbox.stub(CryptoService, 'decrypt').value(() => mocks.contactDetail.id)
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
    sandbox.stub(Address, 'listByPostcode').value(() => [mocks.address, mocks.address, mocks.address])
    sandbox.stub(TaskModel, 'getAddress').value(() => mocks.address)
    sandbox.stub(TaskModel, 'saveSelectedAddress').value(() => undefined)

    if (contactDetailId) {
      sandbox.stub(ContactDetail, 'get').value(() => mocks.contactDetail)
    }
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  const checkPageElements = async (request) => {
    const doc = await GeneralTestHelper.getDoc(request)
    let element = doc.getElementById('page-heading').firstChild
    if (contactDetailId) {
      const { firstName, lastName } = mocks.contactDetail
      Code.expect(element.nodeValue).to.equal(`${pageHeading} ${firstName} ${lastName}?`)
    } else {
      Code.expect(element.nodeValue).to.equal(pageHeading)
    }

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'back-link',
      'defra-csrf-token',
      'postcode-label',
      'select-address-label',
      'select-address',
      'manual-hint',
      'manual-address-link'
    ])

    element = doc.getElementById('postcode-value').firstChild
    Code.expect(element.nodeValue).to.equal(postcode)

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  }

  lab.experiment('Address select page tests:', () => {
    new GeneralTestHelper({ lab, routePath }).test()
    lab.experiment(`GET ${routePath}`, () => {
      lab.experiment('Success:', () => {
        lab.test(`when returns the Address Select page correctly`, async () => {
          await checkPageElements(getRequest)
        })
      })
    })

    lab.experiment(`POST ${routePath}`, () => {
      lab.experiment('Success:', () => {
        lab.test(`when redirects to the Task List route: ${nextRoutePath}`, async () => {
          postRequest.payload['select-address'] = mocks.address.uprn

          const spy = sinon.spy(TaskModel, 'saveSelectedAddress')
          const res = await server.inject(postRequest)
          Code.expect(spy.callCount).to.equal(1)

          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })
      })

      lab.experiment('Failure:', () => {
        lab.test(`when shows an error message when an address has not been selected`, async () => {
          const doc = await GeneralTestHelper.getDoc(postRequest)
          await GeneralTestHelper.checkValidationMessage(doc, 'select-address', 'Select an address')
        })
      })
    })
  })
}
