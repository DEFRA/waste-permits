'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const Address = require('../../../src/models/address.model')
const InvoiceAddress = require('../../../src/models/taskList/invoiceAddress.model')

let validateCookieStub
let invoiceAddressGetAddressStub
let invoiceAddressSaveSelectedAddressStub
let addressListByPostcodeStub

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

const fakeAddress1 = {
  id: 'ADDRESS_ID_1',
  buildingNameOrNumber: '101',
  addressLine1: 'FIRST_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY1',
  postcode: 'AB12 1AA',
  uprn: 'UPRN1',
  fromAddressLookup: true,
  _entity: 'defra_addresses'
}

const fakeAddress2 = {
  id: 'ADDRESS_ID_2',
  buildingNameOrNumber: '102',
  addressLine1: 'SECOND_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY2',
  postcode: 'AB12 2AA',
  uprn: 'UPRN2',
  fromAddressLookup: true,
  _entity: 'defra_addresses'
}

const fakeAddress3 = {
  id: 'ADDRESS_ID_3',
  buildingNameOrNumber: '103',
  addressLine1: 'THIRD_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY3',
  postcode: 'AB12 3AA',
  uprn: 'UPRN3',
  fromAddressLookup: true,
  _entity: 'defra_addresses'
}

lab.beforeEach(() => {
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  invoiceAddressGetAddressStub = InvoiceAddress.getAddress
  InvoiceAddress.getAddress = () => new Address(fakeAddress1)

  invoiceAddressSaveSelectedAddressStub = InvoiceAddress.saveSelectedAddress
  InvoiceAddress.saveSelectedAddress = () => {}

  addressListByPostcodeStub = Address.listByPostcode
  Address.listByPostcode = () => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ]
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  InvoiceAddress.getAddress = invoiceAddressGetAddressStub
  InvoiceAddress.saveSelectedAddress = invoiceAddressSaveSelectedAddressStub
  Address.listByPostcode = addressListByPostcodeStub
})

const checkPageElements = async (request, expectedValue) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(pageHeading)

  const elementIds = [
    'back-link',
    'defra-csrf-token',
    'postcode-label',
    'postcode-hint',
    'manual-hint',
    'manual-address-link',
    'no-postcode-link-text'
  ]
  for (let id of elementIds) {
    element = doc.getElementById(id)
    Code.expect(doc.getElementById(id)).to.exist()
  }

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
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element

  // Panel summary error item
  element = doc.getElementById('error-summary-list-item-0').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

  // Field error
  Code.expect(doc.getElementById('postcode').getAttribute('class')).contains('form-control-error')
  element = doc.getElementById('postcode-error').firstChild.firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Postcode page tests:', () => {
  lab.experiment('General tests:', () => {
    lab.test(`GET ${routePath} redirects to error screen when the user token is invalid`, async () => {
      CookieService.validateCookie = () => {
        return undefined
      }

      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })

    lab.test(`POST ${routePath} redirects to error screen when the user token is invalid`, async () => {
      CookieService.validateCookie = () => {
        return undefined
      }

      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })
  })

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the postcode page correctly when there is no saved postcode`, async () => {
      InvoiceAddress.getAddress = () => {
        return undefined
      }
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
        await checkValidationError(`We can’t find any addresses for that postcode - check it's correct or enter address manually`)
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
