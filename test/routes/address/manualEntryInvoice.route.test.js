'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const sinon = require('sinon')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const Address = require('../../../src/models/address.model')
const InvoiceAddress = require('../../../src/models/taskList/invoiceAddress.model')

let validateCookieStub
let cookieServiceGetStub
let addressListByPostcodeStub
let invoiceAddressGetAddressStub
let invoiceAddressSaveManualAddressStub

const pageHeading = `Where should we send invoices for the annual costs after the permit has been issued?`
const routePath = '/invoice/address/address-manual'
const nextRoutePath = '/task-list'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const postcode = 'BS1 4AH'

const fakeAddress1 = {
  id: 'ADDRESS_ID_1',
  buildingNameOrNumber: '101',
  addressLine1: 'FIRST_ADDRESS_LINE_1',
  addressLine2: 'FIRST_ADDRESS_LINE_2',
  townOrCity: 'THE FIRST TOWN',
  postcode: 'AB12 1AA',
  uprn: 'UPRN1',
  fromAddressLookup: true,
  fullAddress: 'FULL_ADDRESS_1',
  _entity: 'defra_addresses'
}

const fakeAddress2 = {
  id: 'ADDRESS_ID_2',
  buildingNameOrNumber: '102',
  addressLine1: 'SECOND_ADDRESS_LINE_1',
  addressLine2: 'SECOND_ADDRESS_LINE_2',
  townOrCity: 'THE SECOND TOWN',
  postcode: 'AB12 2AA',
  uprn: 'UPRN2',
  fromAddressLookup: true,
  fullAddress: 'FULL_ADDRESS_2',
  _entity: 'defra_addresses'
}

const fakeAddress3 = {
  id: 'ADDRESS_ID_3',
  buildingNameOrNumber: '103',
  addressLine1: 'THIRD_ADDRESS_LINE_1',
  addressLine2: 'SECOND_ADDRESS_LINE_2',
  townOrCity: 'THE THIRD TOWN',
  postcode: 'AB12 3AA',
  uprn: 'UPRN3',
  fromAddressLookup: true,
  fullAddress: 'FULL_ADDRESS_3',
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

  cookieServiceGetStub = CookieService.get
  CookieService.get = () => postcode

  addressListByPostcodeStub = Address.listByPostcode
  Address.listByPostcode = () => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ]

  invoiceAddressGetAddressStub = InvoiceAddress.getAddress
  InvoiceAddress.getAddress = () => new Address(fakeAddress1)

  invoiceAddressSaveManualAddressStub = InvoiceAddress.saveManualAddress
  InvoiceAddress.saveManualAddress = () => undefined
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  CookieService.get = cookieServiceGetStub
  Address.listByPostcode = addressListByPostcodeStub
  InvoiceAddress.getAddress = invoiceAddressGetAddressStub
  InvoiceAddress.saveManualAddress = invoiceAddressSaveManualAddressStub
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
    'building-name-or-number',
    'building-name-or-number-hint',
    'address-line-1',
    'address-line-2',
    'town-or-city',
    'postcode'
  ]
  for (let id of elementIds) {
    element = doc.getElementById(id)
    Code.expect(doc.getElementById(id)).to.exist()
  }

  element = doc.getElementById('invoice-subheading')
  Code.expect(element).to.not.exist()

  // Check value of form elements
  if (expectedValue) {
    element = doc.getElementById('building-name-or-number')
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.buildingNameOrNumber)

    element = doc.getElementById('address-line-1')
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.addressLine1)

    element = doc.getElementById('address-line-2')
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.addressLine2)

    element = doc.getElementById('town-or-city')
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.townOrCity)

    element = doc.getElementById('postcode')
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.postcode)
  } else {
    element = doc.getElementById('building-name-or-number')
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById('address-line-1')
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById('address-line-2')
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById('town-or-city')
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById('postcode')
    Code.expect(element.getAttribute('value')).to.equal('')
  }

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

const checkValidationError = async (fieldId, expectedErrorMessage) => {
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  // Panel summary error item
  let element = doc.getElementById('error-summary-list-item-0').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

  // Field error
  element = doc.getElementById(fieldId + '-error').firstChild.firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Address select page tests:', () => {
  lab.experiment('General tests:', () => {
    lab.test(`GET ${routePath} redirects to error screen when the user token is invalid`, async () => {
      CookieService.validateCookie = () => undefined

      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })

    lab.test(`POST ${routePath} redirects to error screen when the user token is invalid`, async () => {
      CookieService.validateCookie = () => undefined

      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/error')
    })
  })

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the manual address entry page correctly on first visit to the page`, async () => {
      InvoiceAddress.getAddress = () => undefined
      await checkPageElements(getRequest)
    })

    lab.test(`GET ${routePath} returns the manual address entry page correctly on subsequent visits to the page`, async () => {
      const expectedValue = fakeAddress1
      await checkPageElements(getRequest, expectedValue)
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} success redirects to the Task List route: ${nextRoutePath}`, async () => {
        postRequest.payload['building-name-or-number'] = fakeAddress1.buildingNameOrNumber
        postRequest.payload['address-line-1'] = fakeAddress1.addressLine1
        postRequest.payload['address-line-2'] = fakeAddress1.addressLine2
        postRequest.payload['town-or-city'] = fakeAddress1.townOrCity
        postRequest.payload['postcode'] = fakeAddress1.postcode

        const spy = sinon.spy(InvoiceAddress, 'saveManualAddress')
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} shows an error message when the building name or number is blank or whitespace`, async () => {
        postRequest.payload = {
          'building-name-or-number': '',
          'address-line-1': fakeAddress1.addressLine1,
          'address-line-2': fakeAddress1.addressLine2,
          'town-or-city': fakeAddress1.townOrCity,
          'postcode': fakeAddress1.postcode
        }
        await checkValidationError('building-name-or-number', 'Enter the building name or number')

        postRequest.payload['building-name-or-number'] = '      '
        await checkValidationError('building-name-or-number', 'Enter the building name or number')
      })

      lab.test(`POST ${routePath} shows an error message when the address line 1 is blank or whitespace`, async () => {
        postRequest.payload = {
          'building-name-or-number': fakeAddress1.buildingNameOrNumber,
          'address-line-1': '',
          'address-line-2': fakeAddress1.addressLine2,
          'town-or-city': fakeAddress1.townOrCity,
          'postcode': fakeAddress1.postcode
        }
        await checkValidationError('address-line-1', 'Enter an address line 1')

        postRequest.payload['address-line-1'] = '      '
        await checkValidationError('address-line-1', 'Enter an address line 1')
      })

      lab.test(`POST ${routePath} does NOT show an error message when the address line 2 is blank`, async () => {
        postRequest.payload = {
          'building-name-or-number': fakeAddress1.buildingNameOrNumber,
          'address-line-1': fakeAddress1.addressLine1,
          'address-line-2': '',
          'town-or-city': fakeAddress1.townOrCity,
          'postcode': fakeAddress1.postcode
        }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} shows an error message when the town or city is blank or whitespace`, async () => {
        postRequest.payload = {
          'building-name-or-number': fakeAddress1.buildingNameOrNumber,
          'address-line-1': fakeAddress1.addressLine1,
          'address-line-2': fakeAddress1.addressLine2,
          'town-or-city': '',
          'postcode': fakeAddress1.postcode
        }
        await checkValidationError('town-or-city', 'Enter a town or city')

        postRequest.payload['town-or-city'] = '      '
        await checkValidationError('town-or-city', 'Enter a town or city')
      })

      lab.test(`POST ${routePath} shows an error message when the postcode is blank or whitespace`, async () => {
        postRequest.payload = {
          'building-name-or-number': fakeAddress1.buildingNameOrNumber,
          'address-line-1': fakeAddress1.addressLine1,
          'address-line-2': fakeAddress1.addressLine2,
          'town-or-city': fakeAddress1.townOrCity,
          'postcode': ''
        }
        await checkValidationError('postcode', 'Enter a valid postcode')

        postRequest.payload['postcode'] = '      '
        await checkValidationError('postcode', 'Enter a valid postcode')
      })

      // TODO test other validation
    })
  })
})
