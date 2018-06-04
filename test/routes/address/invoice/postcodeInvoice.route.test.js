'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../../../routes/generalTestHelper.test')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const Address = require('../../../../src/models/address.model')
const Application = require('../../../../src/models/application.model')
const Payment = require('../../../../src/models/payment.model')
const InvoiceAddress = require('../../../../src/models/taskList/invoiceAddress.model')
const {COOKIE_RESULT} = require('../../../../src/constants')

let sandbox

const routePath = '/invoice/address/postcode'
const nextRoutePath = '/invoice/address/select-address'
const nextRoutePathManual = '/invoice/address/address-manual'
const pageHeading = `Where should we send invoices for the annual costs after the permit has been issued?`
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationName: 'APPLICATION_NAME'
}

const fakeAddress1 = {
  id: 'ADDRESS_ID_1',
  buildingNameOrNumber: '101',
  addressLine1: 'FIRST_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY1',
  postcode: 'AB12 1AA',
  uprn: 'UPRN1',
  fromAddressLookup: true
}

const fakeAddress2 = {
  id: 'ADDRESS_ID_2',
  buildingNameOrNumber: '102',
  addressLine1: 'SECOND_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY2',
  postcode: 'AB12 2AA',
  uprn: 'UPRN2',
  fromAddressLookup: true
}

const fakeAddress3 = {
  id: 'ADDRESS_ID_3',
  buildingNameOrNumber: '103',
  addressLine1: 'THIRD_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY3',
  postcode: 'AB12 3AA',
  uprn: 'UPRN3',
  fromAddressLookup: true
}

lab.beforeEach(() => {
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(InvoiceAddress, 'getAddress').value(() => new Address(fakeAddress1))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ])
  sandbox.stub(InvoiceAddress, 'saveSelectedAddress').value(() => undefined)
  sandbox.stub(Payment, 'getBacsPayment').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedValue) => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(pageHeading)

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

  element = doc.getElementById('invoice-subheading')
  Code.expect(element).to.exist()

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

lab.experiment('Invoice postcode page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the postcode page correctly when there is no saved postcode`, async () => {
      InvoiceAddress.getAddress = () => undefined
      checkPageElements(getRequest, '')
    })

    lab.test('GET ' + routePath + ' returns the Postcode page correctly when there is an existing postcode', async () => {
      await checkPageElements(getRequest, fakeAddress1.postcode)
    })

    lab.test(`GET ${routePath} redirects to the Manual Address Entry route when the fromAddressLookup is not set: ${nextRoutePath}`, async () => {
      const fakeAddressManual = Object.assign({}, fakeAddress1)
      fakeAddressManual.fromAddressLookup = false
      InvoiceAddress.getAddress = () => new Address(fakeAddressManual)
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePathManual)
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} success redirects to the Address Select route: ${nextRoutePath}`, async () => {
        postRequest.payload = {
          postcode: fakeAddress1.postcode
        }

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} shows an error message when the postcode is blank`, async () => {
        postRequest.payload.postcode = ''
        await checkValidationError('Enter a postcode')
      })

      lab.test(`POST ${routePath} shows an error message when the postcode is whitespace`, async () => {
        postRequest.payload.postcode = '     \t       '
        await checkValidationError('Enter a postcode')
      })

      lab.test(`POST ${routePath} shows an error message when no addresses are found`, async () => {
        postRequest.payload.postcode = fakeAddress1.postcode
        Address.listByPostcode = () => []
        await checkValidationError(`We cannot find any addresses for that postcode - check it is correct or enter address manually`)
      })

      lab.test(`POST ${routePath} shows an error message when the postcode is invalid`, async () => {
        postRequest.payload.postcode = 'INVALID_POSTCODE'
        Address.listByPostcode = () => {
          throw new Error('AddressBase error')
        }
        await checkValidationError('Enter a valid postcode')
      })
    })
  })
})
