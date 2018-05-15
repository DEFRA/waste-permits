'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const Contact = require('../../src/models/contact.model')
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

const routePath = '/permit-holder/name'
const nextRoutePath = '/permit-holder/contact-details'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest
let validPermitHolderDetails

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationName: 'APPLICATION_NAME'
}

lab.beforeEach(() => {
  validPermitHolderDetails = {
    'first-name': 'First',
    'last-name': 'Last',
    'dob-day': '5',
    'dob-month': '3',
    'dob-year': '1995'
  }

  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: validPermitHolderDetails
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
  sandbox.stub(Payment, 'getBacsPayment').value(() => {})
  sandbox.stub(Payment.prototype, 'isPaid').value(() => false)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save')
  sandbox.stub(Contact.prototype, 'save')
  
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedFirstName, expectedLastName) => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`Who will be the permit holder?`)

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

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

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

lab.experiment('Permit Holder Name page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the permit holder name page correctly when it is a new application`, async () => {
      
      // No current permit holder
      fakeApplication.individualPermitHolderId = () => {
        return undefined
      }
      checkPageElements(getRequest, '', '')
    })

    lab.test(`GET ${routePath} returns the permit holder name page correctly when there is an existing contact`, async () => {
      fakeApplication.individualPermitHolderId = () => {
        return 1
      }
      Contact.getIndividualPermitHolderByApplicationId = () => {
        return {
          firstName: 'First Name',
          lastName: 'Last Name'
        }
      }

      checkPageElements(getRequest, 'First Name', 'Last Name')
    })

  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} (new Permit Holder) redirects to the next route ${nextRoutePath}`, async () => {
        // No current permit holder
        fakeApplication.individualPermitHolderId = () => {
          return undefined
        }

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} (existing Permit Holder) redirects to the next route ${nextRoutePath}`, async () => {
        // Existing permit holder
        fakeApplication.individualPermitHolderId = () => {
          return 1
        }
        Contact.getIndividualPermitHolderByApplicationId = () => {
          return {
            firstName: validPermitHolderDetails.firstName,
            lastName: validPermitHolderDetails.lastName
          }
        }

        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`POST ${routePath} (updated Permit Holder) redirects to the next route ${nextRoutePath}`, async () => {
        // Existing permit holder
        fakeApplication.individualPermitHolderId = () => {
          return 1
        }
        Contact.getIndividualPermitHolderByApplicationId = () => {
          return {
            firstName: 'New First Name',
            lastName: 'New Last Name'
          }
        }

        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
      
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} shows an error message when the first name is blank`, async () => {
        postRequest.payload['first-name'] = ''
        await checkValidationErrors('first-name', ['Enter a first name'])
      })

      lab.test(`POST ${routePath} shows an error message when the first name contains invalid characters`, async () => {
        postRequest.payload['first-name'] = '___INVALID_FIRST_NAME___'
        await checkValidationErrors('first-name', ['First name can only include letters, hyphens and apostrophes - delete any other characters'])
      })

      lab.test(`POST ${routePath} shows multiple error messages on the first name field`, async () => {
        postRequest.payload['first-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        const expectedErrors = [
          'Enter a shorter first name with no more than 50 characters',
          'First name can only include letters, hyphens and apostrophes - delete any other characters'
        ]
        await checkValidationErrors('first-name', expectedErrors)
      })

      lab.test(`POST ${routePath} shows an error message when the last name is blank`, async () => {
        postRequest.payload['last-name'] = ''
        await checkValidationErrors('last-name', ['Enter a last name'])
      })

      lab.test(`POST ${routePath} shows an error message when the last name contains invalid characters`, async () => {
        postRequest.payload['last-name'] = '___INVALID_LAST_NAME___'
        await checkValidationErrors('last-name', ['Last name can only include letters, hyphens and apostrophes - delete any other characters'])
      })

      lab.test(`POST ${routePath} shows multiple error messages on the last name field`, async () => {
        postRequest.payload['last-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        const expectedErrors = [
          'Enter a shorter last name with no more than 50 characters',
          'Last name can only include letters, hyphens and apostrophes - delete any other characters'
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
      
    })

  })

})
