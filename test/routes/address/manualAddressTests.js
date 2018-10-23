'use strict'

const Code = require('code')
const sinon = require('sinon')
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

let fakeApplication
let fakeContactDetail
let fakeAddress
let fakeRecovery
let getRequest
let postRequest

const FORM_FIELD_ID = {
  backLink: 'back-link',
  csrfToken: 'defra-csrf-token',
  buildingNameOrNumber: 'building-name-or-number',
  buildingNameOrNumberHint: 'building-name-or-number-hint',
  addressLine1: 'address-line-1',
  addressLine2: 'address-line-2',
  townOrCity: 'town-or-city',
  postcode: 'postcode'
}

module.exports = (lab, { routePath, nextRoutePath, pageHeading, TaskModel, PostCodeCookie, contactDetailId }) => {
  lab.beforeEach(() => {
    fakeApplication = {
      id: 'APPLICATION_ID',
      applicationNumber: 'APPLICATION_NUMBER'
    }

    if (contactDetailId) {
      fakeContactDetail = {
        id: contactDetailId,
        applicationId: fakeApplication.id,
        firstName: 'FIRSTNAME',
        lastName: 'LASTNAME',
        email: 'EMAIL'
      }
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
      payload: {
        [FORM_FIELD_ID.buildingNameOrNumber]: fakeAddress.buildingNameOrNumber,
        [FORM_FIELD_ID.addressLine1]: fakeAddress.addressLine1,
        [FORM_FIELD_ID.addressLine2]: fakeAddress.addressLine2,
        [FORM_FIELD_ID.townOrCity]: fakeAddress.townOrCity,
        [FORM_FIELD_ID.postcode]: fakeAddress.postcode
      }
    }

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub cookies
    GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
      [PostCodeCookie]: () => undefined
    })

    // Stub methods
    sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
    sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
    sandbox.stub(CryptoService, 'decrypt').value(() => fakeContactDetail.id)
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
    sandbox.stub(Address, 'listByPostcode').value(() => [
      new Address(fakeAddress),
      new Address(fakeAddress),
      new Address(fakeAddress)
    ])
    sandbox.stub(TaskModel, 'getAddress').value(() => new Address(fakeAddress))
    sandbox.stub(TaskModel, 'saveManualAddress').value(() => undefined)

    if (contactDetailId) {
      sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(fakeContactDetail))
    }
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  const checkPageElements = async (request, expectedValue) => {
    const doc = await GeneralTestHelper.getDoc(request)
    let element = doc.getElementById('page-heading').firstChild
    if (contactDetailId) {
      const { firstName, lastName } = fakeContactDetail
      Code.expect(element.nodeValue).to.equal(`${pageHeading} ${firstName} ${lastName}?`)
    } else {
      Code.expect(element.nodeValue).to.equal(pageHeading)
    }

    for (let id of Object.values(FORM_FIELD_ID)) {
      element = doc.getElementById(id)
      Code.expect(doc.getElementById(id)).to.exist()
      const value = element.getAttribute('value')
      if (expectedValue) {
        if (expectedValue[id] !== undefined) {
          Code.expect(value).to.equal(expectedValue[id])
        }
      } else {
        Code.expect(value).to.equal('')
      }
    }

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  }

  const checkValidationError = async (fieldId, expectedErrorMessage, fieldIndex = 0) => {
    const doc = await GeneralTestHelper.getDoc(postRequest)

    // Panel summary error item
    let element = doc.getElementById(`error-summary-list-item-${fieldIndex}`).firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

    // Field error
    element = doc.getElementById(fieldId + '-error').firstChild.firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
  }

  lab.experiment('Manual address entry page tests:', () => {
    new GeneralTestHelper({ lab, routePath }).test()

    lab.experiment('GET:', () => {
      lab.test(`GET ${routePath} returns the manual address entry page correctly on first visit to the page`, async () => {
        TaskModel.getAddress = () => undefined
        await checkPageElements(getRequest)
      })

      lab.test(`GET ${routePath} returns the manual address entry page correctly on subsequent visits to the page`, async () => {
        await checkPageElements(getRequest, fakeAddress)
      })

      lab.test(`GET ${routePath} returns the manual address entry page correctly with the postcode from the cookie`, async () => {
        CookieService.get = () => fakeAddress.postcode
        TaskModel.getAddress = () => undefined
        const expectedValue = {
          buildingNameOrNumber: '',
          addressLine1: '',
          addressLine2: '',
          townOrCity: '',
          postcode: fakeAddress.postcode
        }
        await checkPageElements(getRequest, expectedValue)
      })
    })

    lab.experiment('POST:', () => {
      lab.experiment('Success:', () => {
        lab.test(`POST ${routePath} success redirects to the Task List route: ${nextRoutePath}`, async () => {
          const spy = sinon.spy(TaskModel, 'saveManualAddress')
          const res = await server.inject(postRequest)
          Code.expect(spy.callCount).to.equal(1)

          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })
      })

      lab.experiment('Failure:', () => {
        lab.test(`POST ${routePath} shows an error message when the building name or number is blank or whitespace`, async () => {
          postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = ''
          await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, 'Enter the building name or number')

          postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = '      '
          await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, 'Enter the building name or number')
        })

        lab.test(`POST ${routePath} shows an error message when the address line 1 is blank or whitespace`, async () => {
          postRequest.payload[FORM_FIELD_ID.addressLine1] = ''
          await checkValidationError(FORM_FIELD_ID.addressLine1, 'Enter an address line 1')

          postRequest.payload[FORM_FIELD_ID.addressLine1] = '      '
          await checkValidationError(FORM_FIELD_ID.addressLine1, 'Enter an address line 1')
        })

        lab.test(`POST ${routePath} does NOT show an error message when the address line 2 is blank`, async () => {
          postRequest.payload[FORM_FIELD_ID.addressLine2] = ''
          const res = await server.inject(postRequest)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })

        lab.test(`POST ${routePath} shows an error message when the town or city is blank or whitespace`, async () => {
          postRequest.payload[FORM_FIELD_ID.townOrCity] = ''
          await checkValidationError(FORM_FIELD_ID.townOrCity, 'Enter a town or city')

          postRequest.payload[FORM_FIELD_ID.townOrCity] = '      '
          await checkValidationError(FORM_FIELD_ID.townOrCity, 'Enter a town or city')
        })

        lab.test(`POST ${routePath} shows an error message when the town or city has more than one apostrophe`, async () => {
          postRequest.payload[FORM_FIELD_ID.townOrCity] = ''
          await checkValidationError(FORM_FIELD_ID.townOrCity, 'Enter a town or city')

          postRequest.payload[FORM_FIELD_ID.townOrCity] = `King's Cros's`
          await checkValidationError(FORM_FIELD_ID.townOrCity, 'Town or city can only contain one apostrophe - remove all but one')
        })

        lab.test(`POST ${routePath} shows an error message when the maximum field length has been exceeded`, async () => {
          const longValue = 'X'.repeat(81)
          const longTownOrCity = 'X'.repeat(31)
          const longPostcode = 'X'.repeat(9)

          postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = longValue
          postRequest.payload[FORM_FIELD_ID.addressLine1] = longValue
          postRequest.payload[FORM_FIELD_ID.addressLine2] = longValue
          postRequest.payload[FORM_FIELD_ID.townOrCity] = longTownOrCity
          postRequest.payload[FORM_FIELD_ID.postcode] = longPostcode

          await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Enter a shorter building name or number with no more than 50 characters`, 0)
          await checkValidationError(FORM_FIELD_ID.addressLine1, `Enter a shorter address line 1 with no more than 80 characters`, 1)
          await checkValidationError(FORM_FIELD_ID.addressLine2, `Enter a shorter address line 2 with no more than 80 characters`, 2)
          await checkValidationError(FORM_FIELD_ID.townOrCity, `Enter a shorter town or city with no more than 30 characters`, 3)
          await checkValidationError(FORM_FIELD_ID.postcode, `Enter a shorter postcode with no more than 8 characters`, 4)
        })

        lab.test(`POST ${routePath} shows an error message when a field starts with a hyphen`, async () => {
          let valueWithHyphen = '-VALUE'

          postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.addressLine1] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.addressLine2] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.townOrCity] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.postcode] = valueWithHyphen

          await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Building name or number cannot start or end with a dash - please delete it`, 0)
          await checkValidationError(FORM_FIELD_ID.addressLine1, `Address line 1 cannot start or end with a dash - please delete it`, 1)
          await checkValidationError(FORM_FIELD_ID.addressLine2, `Address line 2 cannot start or end with a dash - please delete it`, 2)
          await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city cannot start or end with a dash - please delete it`, 3)
          await checkValidationError(FORM_FIELD_ID.postcode, `Postcode cannot start or end with a dash - please delete it`, 4)
        })

        lab.test(`POST ${routePath} shows an error message when a field ends with a hyphen`, async () => {
          let valueWithHyphen = 'VALUE-'

          postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.addressLine1] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.addressLine2] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.townOrCity] = valueWithHyphen
          postRequest.payload[FORM_FIELD_ID.postcode] = valueWithHyphen

          await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Building name or number cannot start or end with a dash - please delete it`, 0)
          await checkValidationError(FORM_FIELD_ID.addressLine1, `Address line 1 cannot start or end with a dash - please delete it`, 1)
          await checkValidationError(FORM_FIELD_ID.addressLine2, `Address line 2 cannot start or end with a dash - please delete it`, 2)
          await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city cannot start or end with a dash - please delete it`, 3)
          await checkValidationError(FORM_FIELD_ID.postcode, `Postcode cannot start or end with a dash - please delete it`, 4)
        })

        lab.test(`POST ${routePath} shows an error message when the entered text contains invalid characters`, async () => {
          let valueWithNumbers = 'VALUE123'

          postRequest.payload[FORM_FIELD_ID.townOrCity] = valueWithNumbers
          await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city contains text we cannot accept - enter only letters, apostrophes, dashes and spaces`, 0)

          let valueWithPunctuation = 'VALUE...'
          postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = valueWithPunctuation
          postRequest.payload[FORM_FIELD_ID.townOrCity] = valueWithPunctuation

          await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Building name or number contains text we cannot accept - enter only numbers, letters, apostrophes, dashes and spaces`, 0)
          await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city contains text we cannot accept - enter only letters, apostrophes, dashes and spaces`, 1)
        })
      })
    })
  })
}
