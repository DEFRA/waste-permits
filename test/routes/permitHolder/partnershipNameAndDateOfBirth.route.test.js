'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const { formatDateForPersistence } = require('../../../src/utilities/utilities')
const CookieService = require('../../../src/services/cookie.service')
const RecoveryService = require('../../../src/services/recovery.service')
const Application = require('../../../src/models/application.model')
const Contact = require('../../../src/models/contact.model')
const AddressDetail = require('../../../src/models/addressDetail.model')
const ApplicationContact = require('../../../src/models/applicationContact.model')
const PartnerDetails = require('../../../src/models/taskList/partnerDetails.model')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox
let fakePartnershipId = 'PARTNERSHIP_ID'

const routePath = `/permit-holder/partners/name/${fakePartnershipId}`
const errorPath = '/errors/technical-problem'
const nextRoutePath = `/permit-holder/partners/details/${fakePartnershipId}`

let postRequest
let getRequest
let validPartnerDetails
let fakeContact
let fakeRecovery
let fakeAddressDetail
let fakeApplication
let fakeApplicationContact
let fakeApplicationContactList = []
let fakeDate

lab.beforeEach(() => {
  fakeDate = {
    year: 1999,
    month: 11,
    day: 22
  }

  fakeContact = {
    id: 'CONTACT_ID',
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME'
  }

  validPartnerDetails = {
    'first-name': 'First',
    'last-name': 'Last',
    'dob-day': '5',
    'dob-month': '3',
    'dob-year': '1995'
  }

  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER'
  }

  fakeApplicationContact = {
    id: fakePartnershipId,
    applicationId: fakeApplication.id,
    contactId: fakeContact.id
  }

  fakeApplicationContactList = () => [new ApplicationContact(fakeApplicationContact)]

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    application: new Application(fakeApplication)
  })

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }

  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: validPartnerDetails
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(ApplicationContact, 'listByApplicationId').value(() => fakeApplicationContactList())
  sandbox.stub(ApplicationContact.prototype, 'save').value(() => undefined)
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(Contact, 'getByFirstnameLastnameEmail').value(() => fakeContact ? new Contact(fakeContact) : undefined)
  sandbox.stub(Contact.prototype, 'save').value(() => undefined)
  sandbox.stub(PartnerDetails, 'getApplicationContact').value(() => new ApplicationContact(fakeApplicationContact))
  sandbox.stub(PartnerDetails, 'getPageHeading').value((request, heading) => heading.replace('{{name}}', `${fakeContact.firstName} ${fakeContact.lastName}`))
  sandbox.stub(AddressDetail, 'getPartnerDetails').value(() => new AddressDetail(fakeAddressDetail))
  sandbox.stub(AddressDetail.prototype, 'save').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, { firstName, lastName, date }, expectedHeading) => {
  const [year, month, day] = date.split('-')
  const doc = await GeneralTestHelper.getDoc(request)

  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(expectedHeading)

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

  Code.expect(doc.getElementById('first-name').getAttribute('value')).to.equal(firstName)
  Code.expect(doc.getElementById('last-name').getAttribute('value')).to.equal(lastName)
  Code.expect(doc.getElementById('dob-day').getAttribute('value')).to.equal(day)
  Code.expect(doc.getElementById('dob-month').getAttribute('value')).to.equal(month)
  Code.expect(doc.getElementById('dob-year').getAttribute('value')).to.equal(year)
  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
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

lab.experiment('Partner Name and Date of Birth page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`Get ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test('when returns the partner name page correctly when adding the first partner', async () => {
        delete fakeApplicationContact.contactId
        const data = {
          firstName: '',
          lastName: '',
          date: '--'
        }
        checkPageElements(getRequest, data, 'Add the first partner')
      })

      lab.test('when returns the partner name page correctly when adding another partner', async () => {
        delete fakeApplicationContact.contactId
        fakeApplicationContactList = () => [new ApplicationContact(fakeApplicationContact), new ApplicationContact(fakeApplicationContact)]
        const data = {
          firstName: '',
          lastName: '',
          date: '--'
        }
        checkPageElements(getRequest, data, 'Add another partner')
      })

      lab.test('when returns the partner name page correctly pre-filled when editing a partner', async () => {
        fakeApplicationContact.directorDob = formatDateForPersistence(fakeDate)
        const data = {
          firstName: fakeContact.firstName,
          lastName: fakeContact.lastName,
          date: fakeApplicationContact.directorDob
        }

        checkPageElements(getRequest, data, 'Edit this partner')
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`when the applicationContact does not exist`, async () => {
        const stub = sinon.stub(PartnerDetails, 'getApplicationContact').value(() => undefined)
        const res = await server.inject(getRequest)
        stub.restore()
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test(`when (new Partner) redirects to the next route ${nextRoutePath}`, async () => {
        // No current partner
        fakeApplication.individualPermitHolderId = () => {
          return undefined
        }

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`when (existing Partner) redirects to the next route ${nextRoutePath}`, async () => {
        // Existing partner
        fakeApplication.individualPermitHolderId = () => {
          return 1
        }
        Contact.getIndividualPermitHolderByApplicationId = () => {
          return {
            firstName: validPartnerDetails.firstName,
            lastName: validPartnerDetails.lastName
          }
        }

        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test(`when (updated Partner) redirects to the next route ${nextRoutePath}`, async () => {
        // Existing partner

        fakeContact.firstName = 'New First Name'
        fakeContact.lastName = 'New Last Name'

        const res = await server.inject(postRequest)

        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`when the applicationContact does not exist`, async () => {
        const stub = sinon.stub(PartnerDetails, 'getApplicationContact').value(() => undefined)
        const res = await server.inject(postRequest)
        stub.restore()
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })

    lab.experiment('Invalid:', () => {
      const day = 13
      const month = 10
      const year = 2016

      lab.beforeEach(() => {
        sandbox.stub(Date, 'now').value(() => new Date(year, month - 1, day))
        postRequest.payload['dob-day'] = day
        postRequest.payload['dob-month'] = month
      })

      lab.test(`shows an error message when the first name is blank`, async () => {
        postRequest.payload['first-name'] = ''
        await checkValidationErrors('first-name', ['Enter a first name'])
      })

      lab.test(`shows an error message when the first name contains invalid characters`, async () => {
        postRequest.payload['first-name'] = '___INVALID_FIRST_NAME___'
        await checkValidationErrors('first-name', ['First name can only include letters, hyphens and apostrophes - delete any other characters'])
      })

      lab.test(`shows multiple error messages on the first name field`, async () => {
        postRequest.payload['first-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        const expectedErrors = [
          'Enter a shorter first name with no more than 50 characters',
          'First name can only include letters, hyphens and apostrophes - delete any other characters'
        ]
        await checkValidationErrors('first-name', expectedErrors)
      })

      lab.test(`shows an error message when the last name is blank`, async () => {
        postRequest.payload['last-name'] = ''
        await checkValidationErrors('last-name', ['Enter a last name'])
      })

      lab.test(`shows an error message when the last name contains invalid characters`, async () => {
        postRequest.payload['last-name'] = '___INVALID_LAST_NAME___'
        await checkValidationErrors('last-name', ['Last name can only include letters, hyphens and apostrophes - delete any other characters'])
      })

      lab.test(`shows multiple error messages on the last name field`, async () => {
        postRequest.payload['last-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
        const expectedErrors = [
          'Enter a shorter last name with no more than 50 characters',
          'Last name can only include letters, hyphens and apostrophes - delete any other characters'
        ]
        await checkValidationErrors('last-name', expectedErrors)
      })

      lab.test(`shows an error message when the day of birth is blank`, async () => {
        postRequest.payload['dob-day'] = ''
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`shows an error message when the month of birth is blank`, async () => {
        postRequest.payload['dob-month'] = ''
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`shows an error message when the year of birth is blank`, async () => {
        postRequest.payload['dob-year'] = ''
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`shows an error message when the date of birth is not a real date`, async () => {
        postRequest.payload['dob-month'] = '15'
        await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
      })

      lab.test(`shows an error message when the age is less than 16`, async () => {
        postRequest.payload['dob-day'] = day + 1
        postRequest.payload['dob-year'] = year - 16
        await checkValidationErrors('dob-day', ['Enter a date of birth that is older than 16 and under 120 years of age'])
      })

      lab.test(`shows an error message when the age is greater than 120`, async () => {
        postRequest.payload['dob-year'] = year - 120
        await checkValidationErrors('dob-day', ['Enter a date of birth that is older than 16 and under 120 years of age'])
      })
    })
  })
})
