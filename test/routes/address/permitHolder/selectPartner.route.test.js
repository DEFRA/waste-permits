'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../../../routes/generalTestHelper.test')

const server = require('../../../../server')
const CookieService = require('../../../../src/services/cookie.service')
const CryptoService = require('../../../../src/services/crypto.service')
const RecoveryService = require('../../../../src/services/recovery.service')
const Address = require('../../../../src/models/address.model')
const Application = require('../../../../src/models/application.model')
const ApplicationContact = require('../../../../src/models/applicationContact.model')
const Contact = require('../../../../src/models/contact.model')
const PartnerDetails = require('../../../../src/models/taskList/partnerDetails.model')
const { COOKIE_RESULT } = require('../../../../src/constants')

let sandbox
let fakePartnershipId = 'PARTNERSHIP_ID'

const routePath = `/permit-holder/partners/address/select-address/${fakePartnershipId}`
const nextRoutePath = '/permit-holder/partners/list'

let fakeApplication
let fakeApplicationContact
let fakeAddress
let fakeContact
let fakeRecovery
let getRequest
let postRequest

const postcode = 'BS1 4AH'

lab.beforeEach(() => {
  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }

  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER'
  }

  fakeContact = {
    id: 'CONTACT_ID',
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    email: 'EMAIL'
  }

  fakeApplicationContact = {
    id: 'APPLICATION_CONTACT_ID',
    applicationId: fakeApplication.id,
    contactId: fakeContact.id
  }

  fakeAddress = {
    id: 'ADDRESS_ID',
    buildingNameOrNumber: '101',
    addressLine1: 'ADDRESS_LINE_1',
    addressLine2: 'ADDRESS_LINE_2',
    townOrCity: 'THE TOWN',
    postcode: 'AB12 1AA',
    uprn: 'UPRN1',
    fromAddressLookup: true,
    fullAddress: 'FULL_ADDRESS'
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: 'APPLICATION_LINE_ID',
    application: new Application(fakeApplication)
  })

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
    'PARTNER_POSTCODE': () => postcode
  })

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(CryptoService, 'decrypt').value(() => fakeApplicationContact.id)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationContact, 'getById').value(() => new ApplicationContact(fakeApplicationContact))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress),
    new Address(fakeAddress),
    new Address(fakeAddress)
  ])
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(PartnerDetails, 'getAddress').value(() => new Address(fakeAddress))
  sandbox.stub(PartnerDetails, 'saveSelectedAddress').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, name) => {
  const doc = await GeneralTestHelper.getDoc(request)
  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What is the address for ${name}?`)

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

lab.experiment('Partner address select page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`GET ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test(`when returns the Address Select page correctly`, async () => {
        const { firstName, lastName } = fakeContact
        await checkPageElements(getRequest, `${firstName} ${lastName}`)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test(`when redirects to the Task List route: ${nextRoutePath}`, async () => {
        postRequest.payload['select-address'] = fakeAddress.uprn

        const spy = sinon.spy(PartnerDetails, 'saveSelectedAddress')
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