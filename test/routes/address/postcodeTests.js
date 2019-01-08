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

let sandbox

let getRequest
let postRequest
let mocks

module.exports = (lab, { permitHolderType, routePath, nextRoutePath, nextRoutePathManual, pageHeading, TaskModel, PostCodeCookie, contactDetailId }) => {
  lab.beforeEach(() => {
    mocks = new Mocks()

    if (permitHolderType) {
      mocks.recovery.charityDetail = mocks.charityDetail
    }

    getRequest = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {},
      app: { data: mocks.recovery }
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
      [PostCodeCookie]: () => undefined
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

  const checkPageElements = async (request, expectedValue) => {
    const doc = await GeneralTestHelper.getDoc(request)
    let heading = GeneralTestHelper.getText(doc.getElementById('page-heading'))
    if (contactDetailId) {
      const { firstName, lastName } = mocks.contactDetail
      Code.expect(heading).to.equal(`${pageHeading} ${firstName} ${lastName}?`)
    } else {
      Code.expect(heading).to.equal(pageHeading)
    }

    if (permitHolderType) {
      Code.expect(doc.getElementById('charity-address-subheading')).to.exist()
    } else {
      Code.expect(doc.getElementById('charity-address-subheading')).to.not.exist()
    }

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'back-link',
      'defra-csrf-token',
      'postcode-label',
      'postcode-hint',
      'manual-hint',
      'manual-address-link',
      'no-postcode-link-text'
    ])

    let element = doc.getElementById('invoice-subheading')
    if (PostCodeCookie === 'INVOICE_POSTCODE') {
      Code.expect(element).to.exist()
    } else {
      Code.expect(element).to.not.exist()
    }

    element = doc.getElementById('postcode')
    Code.expect(element.getAttribute('value')).to.equal(expectedValue)

    element = doc.getElementById('no-postcode-link-text').firstChild
    Code.expect(element.nodeValue).to.equal(`Enter address manually`)

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Find address')
  }

  const checkValidationError = async (expectedErrorMessage) => {
    const doc = await GeneralTestHelper.getDoc(postRequest)
    let element

    // Panel summary error item
    element = doc.getElementById('error-summary-list-item-0').firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

    // Field error
    element = doc.getElementById('postcode-error').firstChild.firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
  }

  lab.experiment('Postcode page tests:', () => {
    new GeneralTestHelper({ lab, routePath }).test()

    lab.experiment(`GET ${routePath}`, () => {
      lab.test(`when returns the postcode page correctly when there is no saved postcode`, async () => {
        TaskModel.getAddress = () => undefined
        await checkPageElements(getRequest, '')
      })

      lab.test('when returns the Postcode page correctly when there is an existing postcode', async () => {
        await checkPageElements(getRequest, mocks.address.postcode)
      })

      lab.test(`when redirects to the Manual Address Entry route when the fromAddressLookup is not set: ${nextRoutePath}`, async () => {
        mocks.address.fromAddressLookup = false
        TaskModel.getAddress = () => mocks.address
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePathManual)
      })
    })

    lab.experiment(`POST ${routePath}`, () => {
      lab.experiment('Success:', () => {
        lab.test(`when redirects to the Address Select route: ${nextRoutePath}`, async () => {
          postRequest.payload = {
            postcode: mocks.address.postcode
          }

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })
      })

      lab.experiment('Invalid:', () => {
        lab.test(`when shows an error message when the postcode is blank`, async () => {
          postRequest.payload.postcode = ''
          await checkValidationError('Enter a postcode')
        })

        lab.test(`when an error message when the postcode is whitespace`, async () => {
          postRequest.payload.postcode = '     \t       '
          await checkValidationError('Enter a postcode')
        })

        lab.test(`when an error message when no addresses are found`, async () => {
          postRequest.payload.postcode = mocks.address.postcode
          Address.listByPostcode = () => []
          await checkValidationError(`We cannot find any addresses for that postcode - check it is correct or enter address manually`)
        })
      })

      lab.experiment('Failure:', () => {
        lab.test(`when redirects to manual address input with an error`, async () => {
          postRequest.payload.postcode = 'INVALID_POSTCODE'
          Address.listByPostcode = () => {
            throw new Error('AddressBase error')
          }

          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(`${nextRoutePathManual}?addressLookupFailed=true`)
        })
      })
    })
  })
}
