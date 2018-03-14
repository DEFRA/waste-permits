'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const sinon = require('sinon')
const GeneralTestHelper = require('../../../routes/generalTestHelper.test')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const Address = require('../../../../src/models/address.model')
const Application = require('../../../../src/models/application.model')
const Payment = require('../../../../src/models/payment.model')
const SiteNameAndLocation = require('../../../../src/models/taskList/siteNameAndLocation.model')
const {COOKIE_RESULT} = require('../../../../src/constants')

let sandbox

const pageHeading = `What's the site address?`
const routePath = '/site/address/select-address'
const nextRoutePath = '/task-list'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const postcode = 'BS1 4AH'

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
  fromAddressLookup: true,
  fullAddress: 'FULL_ADDRESS_1'
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
  fullAddress: 'FULL_ADDRESS_2'
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
  fullAddress: 'FULL_ADDRESS_3'
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
  sandbox.stub(CookieService, 'get').value(() => postcode)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ])
  sandbox.stub(SiteNameAndLocation, 'getAddress').value(() => new Address(fakeAddress1))
  sandbox.stub(SiteNameAndLocation, 'saveSelectedAddress').value(() => undefined)
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (getRequest) => {
  const res = await server.inject(getRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(pageHeading)

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

lab.experiment('Site address select page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the Address Select page correctly`, async () => {
      await checkPageElements(getRequest)
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} success redirects to the Task List route: ${nextRoutePath}`, async () => {
        postRequest.payload['select-address'] = fakeAddress1.uprn

        const spy = sinon.spy(SiteNameAndLocation, 'saveSelectedAddress')
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
