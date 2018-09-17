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

const routePath = `/permit-holder/partners/address/postcode/${fakePartnershipId}`
const nextRoutePath = `/permit-holder/partners/address/select-address/${fakePartnershipId}`
const nextRoutePathManual = `/permit-holder/partners/address/address-manual/${fakePartnershipId}`

let fakeApplication
let fakeApplicationContact
let fakeAddress
let fakeContact
let fakeRecovery
let getRequest
let postRequest

lab.beforeEach(() => {
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

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(CryptoService, 'decrypt').value(() => fakeApplicationContact.id)
  sandbox.stub(CryptoService, 'encrypt').value(() => fakeApplicationContact.id)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ApplicationContact, 'getById').value(() => new ApplicationContact(fakeApplicationContact))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress),
    new Address(fakeAddress),
    new Address(fakeAddress)
  ])
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(PartnerDetails, 'getAddress').value(() => new Address(fakeAddress))
  sandbox.stub(PartnerDetails, 'saveManualAddress').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedValue, name) => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What is the address for ${name}?`)

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
  Code.expect(element).to.not.exist()

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

lab.experiment('Partner postcode page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`GET ${routePath}`, () => {
    lab.test(`when returns the postcode page correctly when there is no saved postcode`, async () => {
      PartnerDetails.getAddress = () => undefined
      const { firstName, lastName } = fakeContact
      await checkPageElements(getRequest, '', `${firstName} ${lastName}`)
    })

    lab.test('when returns the Postcode page correctly when there is an existing postcode', async () => {
      const { firstName, lastName } = fakeContact
      await checkPageElements(getRequest, fakeAddress.postcode, `${firstName} ${lastName}`)
    })

    lab.test(`when redirects to the Manual Address Entry route when the fromAddressLookup is not set: ${nextRoutePath}`, async () => {
      const fakeAddressManual = Object.assign({}, fakeAddress)
      fakeAddressManual.fromAddressLookup = false
      PartnerDetails.getAddress = () => new Address(fakeAddressManual)
      const res = await server.inject(getRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal(nextRoutePathManual)
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test(`when redirects to the Address Select route: ${nextRoutePath}`, async () => {
        postRequest.payload = {
          postcode: fakeAddress.postcode
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
        postRequest.payload.postcode = fakeAddress.postcode
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
