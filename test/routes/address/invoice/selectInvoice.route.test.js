'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const sinon = require('sinon')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const Address = require('../../../../src/models/address.model')
const InvoiceAddress = require('../../../../src/models/taskList/invoiceAddress.model')

let validateCookieStub
let cookieServiceGetStub
let addressListByPostcodeStub
let invoiceAddressGetAddressStub
let invoiceAddressSaveSelectedAddressStub

const pageHeading = `What's the invoice address?`
const routePath = '/invoice/address/select-address'
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
  addressLine2: undefined,
  townOrCity: 'CITY1',
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
  addressLine2: undefined,
  townOrCity: 'CITY2',
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
  addressLine2: undefined,
  townOrCity: 'CITY3',
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

  invoiceAddressSaveSelectedAddressStub = InvoiceAddress.saveSelectedAddress
  InvoiceAddress.saveSelectedAddress = () => undefined
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  CookieService.get = cookieServiceGetStub
  Address.listByPostcode = addressListByPostcodeStub
  InvoiceAddress.getAddress = invoiceAddressGetAddressStub
  InvoiceAddress.saveSelectedAddress = invoiceAddressSaveSelectedAddressStub
})

const checkPageElements = async (getRequest) => {
  const res = await server.inject(getRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(pageHeading)

  const elementIds = [
    'back-link',
    'defra-csrf-token',
    'postcode-label',
    'select-address-label',
    'select-address',
    'manual-hint',
    'manual-address-link'
  ]
  for (let id of elementIds) {
    element = doc.getElementById(id)
    Code.expect(doc.getElementById(id)).to.exist()
  }

  element = doc.getElementById('postcode-value').firstChild
  Code.expect(element.nodeValue).to.equal(postcode)

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

const checkValidationError = async (expectedErrorMessage) => {
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  // Panel summary error item
  let element = doc.getElementById('error-summary-list-item-0').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

  // Field error
  element = doc.getElementById('select-address-error').firstChild.firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
}

lab.experiment('Address select page tests:', () => {
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
    lab.test(`GET ${routePath} returns the Address Select page correctly`, async () => {
      await checkPageElements(getRequest)
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} success redirects to the Task List route: ${nextRoutePath}`, async () => {
        postRequest.payload['select-address'] = fakeAddress1.uprn

        const spy = sinon.spy(InvoiceAddress, 'saveSelectedAddress')
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} shows an error message when an address has not been selected`, async () => {
        await checkValidationError('Select an address')
      })
    })
  })
})
