'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const Application = require('../../../src/persistence/entities/application.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/permit-holder/name'
const nextRoutePath = '/permit-holder/contact-details'

let sandbox
let mocks
let getContactDetailStub

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  getContactDetailStub = sandbox.stub(ContactDetail, 'get')
  getContactDetailStub.value(() => mocks.contactDetail)
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedFirstName = '', expectedLastName = '', expectedDateOfBirth = '---') => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal('Who will be the permit holder?')

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'back-link',
    'defra-csrf-token',
    'first-name',
    'last-name',
    'dob-day',
    'dob-month',
    'dob-year'
  ])

  element = doc.getElementById('first-name')
  Code.expect(element.getAttribute('value')).to.equal(expectedFirstName)

  element = doc.getElementById('last-name')
  Code.expect(element.getAttribute('value')).to.equal(expectedLastName)

  const [dobYear, dobMonth, dobDay] = expectedDateOfBirth.split('-')

  element = doc.getElementById('dob-day')
  Code.expect(element.getAttribute('value')).to.equal(dobDay)

  element = doc.getElementById('dob-month')
  Code.expect(element.getAttribute('value')).to.equal(dobMonth)

  element = doc.getElementById('dob-year')
  Code.expect(element.getAttribute('value')).to.equal(dobYear)

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

lab.experiment('Permit Holder Name page tests:', () => {
  let getRequest

  new GeneralTestHelper({ lab, routePath }).test()

  lab.beforeEach(() => {
    getRequest = {
      method: 'GET',
      url: routePath,
      headers: {}
    }
  })

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the permit holder name page correctly when it is a new application`, async () => {
      // No current permit holder
      getContactDetailStub.value(() => undefined)
      checkPageElements(getRequest)
    })

    lab.test(`GET ${routePath} returns the permit holder name page correctly when there is an existing contact`, async () => {
      const { firstName, lastName, dateOfBirth } = mocks.contactDetail
      checkPageElements(getRequest, firstName, lastName, dateOfBirth)
    })
  })

  lab.experiment('POST:', () => {
    let postRequest

    const checkValidationErrors = async (field, expectedErrors) => {
      const doc = await GeneralTestHelper.getDoc(postRequest)

      let element

      for (let i = 0; i < expectedErrors.length; i++) {
        // Panel summary error item
        element = doc.getElementById(`error-summary-list-item-${i}`).firstChild
        Code.expect(element.nodeValue).to.equal(expectedErrors[i])

        // Field error
        Code.expect(doc.getElementById(field).getAttribute('class')).contains('form-control-error')
        element = doc.getElementById(`${field}-error`).childNodes[i].firstChild
        Code.expect(element.nodeValue).to.equal(expectedErrors[i])
      }
    }

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'first-name': mocks.contactDetail.firstName,
          'last-name': mocks.contactDetail.lastName,
          'dob-day': '5',
          'dob-month': '3',
          'dob-year': '1995'
        }
      }
    })

    lab.experiment('Success:', () => {
      lab.test(`(new Permit Holder) redirects to the next route ${nextRoutePath}`, async () => {
        // No current permit holder
        mocks.application.individualPermitHolderId = () => {
          return undefined
        }

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} (existing Permit Holder) redirects to the next route ${nextRoutePath}`, async () => {
        // Existing permit holder
        mocks.application.individualPermitHolderId = () => {
          return 1
        }

        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} (updated Permit Holder) redirects to the next route ${nextRoutePath}`, async () => {
        // Existing permit holder
        mocks.application.individualPermitHolderId = () => {
          return 1
        }

        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      const day = 13
      const month = 10
      const year = 2016

      lab.beforeEach(() => {
        sandbox.stub(Date, 'now').value(() => new Date(year, month - 1, day))
        postRequest.payload['dob-day'] = day
        postRequest.payload['dob-month'] = month
      })

      lab.test(`POST ${routePath} shows an error message when the first name is blank`, async () => {
        postRequest.payload['first-name'] = ''
        await checkValidationErrors('first-name', ['Enter a first name'])
      })

      lab.test(`POST ${routePath} shows an error message when the first name contains invalid characters`, async () => {
        postRequest.payload['first-name'] = '___INVALID_FIRST_NAME___'
        await checkValidationErrors('first-name', ['First name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters'])
      })

      lab.test(`POST ${routePath} shows multiple error messages on the first name field`, async () => {
        postRequest.payload['first-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        const expectedErrors = [
          'Enter a shorter first name with no more than 50 characters',
          'First name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters'
        ]
        await checkValidationErrors('first-name', expectedErrors)
      })

      lab.test(`POST ${routePath} shows an error message when the last name is blank`, async () => {
        postRequest.payload['last-name'] = ''
        await checkValidationErrors('last-name', ['Enter a last name'])
      })

      lab.test(`POST ${routePath} shows an error message when the last name contains invalid characters`, async () => {
        postRequest.payload['last-name'] = '___INVALID_LAST_NAME___'
        await checkValidationErrors('last-name', ['Last name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters'])
      })

      lab.test(`POST ${routePath} shows multiple error messages on the last name field`, async () => {
        postRequest.payload['last-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        const expectedErrors = [
          'Enter a shorter last name with no more than 50 characters',
          'Last name can only include letters, hyphens, apostrophes and up to 2 spaces - delete any other characters'
        ]
        await checkValidationErrors('last-name', expectedErrors)
      })

      lab.test(`POST ${routePath} shows an error message when the day of birth is blank`, async () => {
        postRequest.payload['dob-day'] = ''
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`POST ${routePath} shows an error message when the month of birth is blank`, async () => {
        postRequest.payload['dob-month'] = ''
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`POST ${routePath} shows an error message when the year of birth is blank`, async () => {
        postRequest.payload['dob-year'] = ''
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`POST ${routePath} shows an error message when the date of birth is not a real date`, async () => {
        postRequest.payload['dob-month'] = '15'
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`POST ${routePath} shows an error message when the date of birth is not a number`, async () => {
        postRequest.payload['dob-day'] = 'XX'
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`POST ${routePath} shows an error message when the date of birth is not an integer`, async () => {
        postRequest.payload['dob-day'] = '4.4'
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`POST ${routePath} shows an error message when the age is less than 16`, async () => {
        postRequest.payload['dob-day'] = day + 1
        postRequest.payload['dob-year'] = year - 16
        await checkValidationErrors('dob-day', ['Enter a date of birth that is older than 16 and under 120 years of age'])
      })

      lab.test(`POST ${routePath} shows an error message when the age is greater than 120`, async () => {
        postRequest.payload['dob-year'] = year - 120
        await checkValidationErrors('dob-day', ['Enter a date of birth that is older than 16 and under 120 years of age'])
      })
    })
  })
})
