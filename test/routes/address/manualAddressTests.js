'use strict'

const Code = require('@hapi/code')
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

module.exports = (lab, { permitHolderType, routePath, nextRoutePath, pageHeading, TaskModel, PostCodeCookie, contactDetailId }) => {
  let sandbox
  let getRequest
  let postRequest
  let mocks

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
      payload: {
        [FORM_FIELD_ID.buildingNameOrNumber]: mocks.address.buildingNameOrNumber,
        [FORM_FIELD_ID.addressLine1]: mocks.address.addressLine1,
        [FORM_FIELD_ID.addressLine2]: mocks.address.addressLine2,
        [FORM_FIELD_ID.townOrCity]: mocks.address.townOrCity,
        [FORM_FIELD_ID.postcode]: mocks.address.postcode
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
    sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
    sandbox.stub(CryptoService, 'decrypt').value(() => mocks.contactDetail.id)
    sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
    sandbox.stub(Address, 'listByPostcode').value(() => [mocks.address, mocks.address, mocks.address])
    sandbox.stub(TaskModel, 'getAddress').value(() => mocks.address)
    sandbox.stub(TaskModel, 'saveManualAddress').value(() => undefined)

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

    for (let id of Object.values(FORM_FIELD_ID)) {
      const element = doc.getElementById(id)
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

    Code.expect(GeneralTestHelper.getText(doc.getElementById('submit-button'))).to.equal('Continue')
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
        await checkPageElements(getRequest, mocks.address)
      })

      lab.test(`GET ${routePath} returns the manual address entry page correctly with the postcode from the cookie`, async () => {
        CookieService.get = () => mocks.address.postcode
        TaskModel.getAddress = () => undefined
        const expectedValue = {
          buildingNameOrNumber: '',
          addressLine1: '',
          addressLine2: '',
          townOrCity: '',
          postcode: mocks.address.postcode
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
