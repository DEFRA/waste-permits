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
const SiteNameAndLocation = require('../../../../src/models/taskList/siteNameAndLocation.model')
const { COOKIE_RESULT } = require('../../../../src/constants')

let sandbox

const pageHeading = `Enter the site address`
const routePath = '/site/address/address-manual'
const nextRoutePath = '/task-list'

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

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationNumber: 'APPLICATION_NUMBER'
}

const fakeAddress1 = {
  id: 'ADDRESS_ID_1',
  buildingNameOrNumber: '101',
  addressLine1: 'FIRST_ADDRESS_LINE_1',
  addressLine2: 'FIRST_ADDRESS_LINE_2',
  townOrCity: 'THE FIRST TOWN',
  postcode: 'AB12 1AA',
  uprn: 'UPRN1',
  fromAddressLookup: true,
  fullAddress: 'FULL_ADDRESS_1'
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
  fullAddress: 'FULL_ADDRESS_2'
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

  // Stub cookies
  GeneralTestHelper.stubGetCookies(sandbox, CookieService, {
    'SITE_POSTCODE': () => undefined
  })

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ])
  sandbox.stub(SiteNameAndLocation, 'getAddress').value(() => new Address(fakeAddress1))
  sandbox.stub(SiteNameAndLocation, 'saveManualAddress').value(() => undefined)
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => {})
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

  for (let id of Object.values(FORM_FIELD_ID)) {
    element = doc.getElementById(id)
    Code.expect(doc.getElementById(id)).to.exist()
  }

  // Check value of form elements
  if (expectedValue) {
    element = doc.getElementById(FORM_FIELD_ID.buildingNameOrNumber)
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.buildingNameOrNumber)

    element = doc.getElementById(FORM_FIELD_ID.addressLine1)
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.addressLine1)

    element = doc.getElementById(FORM_FIELD_ID.addressLine2)
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.addressLine2)

    element = doc.getElementById(FORM_FIELD_ID.townOrCity)
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.townOrCity)

    element = doc.getElementById(FORM_FIELD_ID.postcode)
    Code.expect(element.getAttribute('value')).to.equal(expectedValue.postcode)
  } else {
    element = doc.getElementById(FORM_FIELD_ID.buildingNameOrNumber)
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById(FORM_FIELD_ID.addressLine1)
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById(FORM_FIELD_ID.addressLine2)
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById(FORM_FIELD_ID.townOrCity)
    Code.expect(element.getAttribute('value')).to.equal('')

    element = doc.getElementById(FORM_FIELD_ID.postcode)
    Code.expect(element.getAttribute('value')).to.equal('')
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

lab.experiment('Address select page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the manual address entry page correctly on first visit to the page`, async () => {
      SiteNameAndLocation.getAddress = () => undefined
      await checkPageElements(getRequest)
    })

    lab.test(`GET ${routePath} returns the manual address entry page correctly on subsequent visits to the page`, async () => {
      await checkPageElements(getRequest, fakeAddress1)
    })

    lab.test(`GET ${routePath} returns the manual address entry page correctly with the postcode from the cookie`, async () => {
      CookieService.get = () => fakeAddress1.postcode
      SiteNameAndLocation.getAddress = () => undefined
      const expectedValue = {
        buildingNameOrNumber: '',
        addressLine1: '',
        addressLine2: '',
        townOrCity: '',
        postcode: fakeAddress1.postcode
      }
      await checkPageElements(getRequest, expectedValue)
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} success redirects to the Task List route: ${nextRoutePath}`, async () => {
        postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = fakeAddress1.buildingNameOrNumber
        postRequest.payload[FORM_FIELD_ID.addressLine1] = fakeAddress1.addressLine1
        postRequest.payload[FORM_FIELD_ID.addressLine2] = fakeAddress1.addressLine2
        postRequest.payload[FORM_FIELD_ID.townOrCity] = fakeAddress1.townOrCity
        postRequest.payload[FORM_FIELD_ID.postcode] = fakeAddress1.postcode

        const spy = sinon.spy(SiteNameAndLocation, 'saveManualAddress')
        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} shows an error message when the building name or number is blank or whitespace`, async () => {
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: '',
          [FORM_FIELD_ID.addressLine1]: fakeAddress1.addressLine1,
          [FORM_FIELD_ID.addressLine2]: fakeAddress1.addressLine2,
          [FORM_FIELD_ID.townOrCity]: fakeAddress1.townOrCity,
          [FORM_FIELD_ID.postcode]: fakeAddress1.postcode
        }
        await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, 'Enter the building name or number')

        postRequest.payload[FORM_FIELD_ID.buildingNameOrNumber] = '      '
        await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, 'Enter the building name or number')
      })

      lab.test(`POST ${routePath} shows an error message when the address line 1 is blank or whitespace`, async () => {
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: fakeAddress1.buildingNameOrNumber,
          [FORM_FIELD_ID.addressLine1]: '',
          [FORM_FIELD_ID.addressLine2]: fakeAddress1.addressLine2,
          [FORM_FIELD_ID.townOrCity]: fakeAddress1.townOrCity,
          [FORM_FIELD_ID.postcode]: fakeAddress1.postcode
        }
        await checkValidationError(FORM_FIELD_ID.addressLine1, 'Enter an address line 1')

        postRequest.payload[FORM_FIELD_ID.addressLine1] = '      '
        await checkValidationError(FORM_FIELD_ID.addressLine1, 'Enter an address line 1')
      })

      lab.test(`POST ${routePath} does NOT show an error message when the address line 2 is blank`, async () => {
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: fakeAddress1.buildingNameOrNumber,
          [FORM_FIELD_ID.addressLine1]: fakeAddress1.addressLine1,
          [FORM_FIELD_ID.addressLine2]: '',
          [FORM_FIELD_ID.townOrCity]: fakeAddress1.townOrCity,
          [FORM_FIELD_ID.postcode]: fakeAddress1.postcode
        }
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} shows an error message when the town or city is blank or whitespace`, async () => {
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: fakeAddress1.buildingNameOrNumber,
          [FORM_FIELD_ID.addressLine1]: fakeAddress1.addressLine1,
          [FORM_FIELD_ID.addressLine2]: fakeAddress1.addressLine2,
          [FORM_FIELD_ID.townOrCity]: '',
          [FORM_FIELD_ID.postcode]: fakeAddress1.postcode
        }
        await checkValidationError(FORM_FIELD_ID.townOrCity, 'Enter a town or city')

        postRequest.payload[FORM_FIELD_ID.townOrCity] = '      '
        await checkValidationError(FORM_FIELD_ID.townOrCity, 'Enter a town or city')
      })

      lab.test(`POST ${routePath} shows an error message when the maximum field length has been exceeded`, async () => {
        const longValue = 'X'.repeat(81)
        const longTownOrCity = 'X'.repeat(31)
        const longPostcode = 'X'.repeat(9)

        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: longValue,
          [FORM_FIELD_ID.addressLine1]: longValue,
          [FORM_FIELD_ID.addressLine2]: longValue,
          [FORM_FIELD_ID.townOrCity]: longTownOrCity,
          [FORM_FIELD_ID.postcode]: longPostcode
        }
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: longValue,
          [FORM_FIELD_ID.addressLine1]: longValue,
          [FORM_FIELD_ID.addressLine2]: longValue,
          [FORM_FIELD_ID.townOrCity]: longTownOrCity,
          [FORM_FIELD_ID.postcode]: longPostcode
        }
        await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Enter a shorter building name or number with no more than 50 characters`, 0)
        await checkValidationError(FORM_FIELD_ID.addressLine1, `Enter a shorter address line 1 with no more than 80 characters`, 1)
        await checkValidationError(FORM_FIELD_ID.addressLine2, `Enter a shorter address line 2 with no more than 80 characters`, 2)
        await checkValidationError(FORM_FIELD_ID.townOrCity, `Enter a shorter town or city with no more than 30 characters`, 3)
        await checkValidationError(FORM_FIELD_ID.postcode, `Enter a shorter postcode with no more than 8 characters`, 4)
      })

      lab.test(`POST ${routePath} shows an error message when a field starts with a hyphen`, async () => {
        let valueWithHyphen = '-VALUE'
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: valueWithHyphen,
          [FORM_FIELD_ID.addressLine1]: valueWithHyphen,
          [FORM_FIELD_ID.addressLine2]: valueWithHyphen,
          [FORM_FIELD_ID.townOrCity]: valueWithHyphen,
          [FORM_FIELD_ID.postcode]: valueWithHyphen
        }
        await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Building name or number cannot start or end with a dash - please delete it`, 0)
        await checkValidationError(FORM_FIELD_ID.addressLine1, `Address line 1 cannot start or end with a dash - please delete it`, 1)
        await checkValidationError(FORM_FIELD_ID.addressLine2, `Address line 2 cannot start or end with a dash - please delete it`, 2)
        await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city cannot start or end with a dash - please delete it`, 3)
        await checkValidationError(FORM_FIELD_ID.postcode, `Postcode cannot start or end with a dash - please delete it`, 4)
      })

      lab.test(`POST ${routePath} shows an error message when a field ends with a hyphen`, async () => {
        let valueWithHyphen = 'VALUE-'
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: valueWithHyphen,
          [FORM_FIELD_ID.addressLine1]: valueWithHyphen,
          [FORM_FIELD_ID.addressLine2]: valueWithHyphen,
          [FORM_FIELD_ID.townOrCity]: valueWithHyphen,
          [FORM_FIELD_ID.postcode]: valueWithHyphen
        }
        await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Building name or number cannot start or end with a dash - please delete it`, 0)
        await checkValidationError(FORM_FIELD_ID.addressLine1, `Address line 1 cannot start or end with a dash - please delete it`, 1)
        await checkValidationError(FORM_FIELD_ID.addressLine2, `Address line 2 cannot start or end with a dash - please delete it`, 2)
        await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city cannot start or end with a dash - please delete it`, 3)
        await checkValidationError(FORM_FIELD_ID.postcode, `Postcode cannot start or end with a dash - please delete it`, 4)
      })

      lab.test(`POST ${routePath} shows an error message when the entered text contains invalid characters`, async () => {
        let valueWithNumbers = 'VALUE123'
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: fakeAddress1.buildingNameOrNumber,
          [FORM_FIELD_ID.addressLine1]: fakeAddress1.addressLine1,
          [FORM_FIELD_ID.addressLine2]: fakeAddress1.addressLine2,
          [FORM_FIELD_ID.townOrCity]: valueWithNumbers,
          [FORM_FIELD_ID.postcode]: fakeAddress1.postcode
        }
        await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city contains text we cannot accept - enter only letters, apostrophes, dashes and spaces`, 0)

        let valueWithPunctuation = 'VALUE...'
        postRequest.payload = {
          [FORM_FIELD_ID.buildingNameOrNumber]: valueWithPunctuation,
          [FORM_FIELD_ID.addressLine1]: fakeAddress1.addressLine1,
          [FORM_FIELD_ID.addressLine2]: fakeAddress1.addressLine2,
          [FORM_FIELD_ID.townOrCity]: valueWithPunctuation,
          [FORM_FIELD_ID.postcode]: fakeAddress1.postcode
        }
        await checkValidationError(FORM_FIELD_ID.buildingNameOrNumber, `Building name or number contains text we cannot accept - enter only numbers, letters, apostrophes, dashes and spaces`, 0)
        await checkValidationError(FORM_FIELD_ID.townOrCity, `Town or city contains text we cannot accept - enter only letters, apostrophes, dashes and spaces`, 1)
      })
    })
  })
})
