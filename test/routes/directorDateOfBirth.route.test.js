'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const Account = require('../../src/models/account.model')
const ApplicationContact = require('../../src/models/applicationContact.model')
const Contact = require('../../src/models/contact.model')
const {COOKIE_RESULT} = require('../../src/constants')

let validateCookieStub
let applicationGetByIdStub
let contactListStub
let contactSaveStub
let applicationContactGetStub
let applicationContactSaveStub

const routePath = '/permit-holder/company/director-date-of-birth'
const nextRoutePath = '/permit-holder/company/declare-offences'
const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest

const singleDirectorPageHeading = `What is the director's date of birth?`
const multipleDirectorPageHeading = `What are the directors' dates of birth?`

const fakeCompanyData = {
  name: 'THE COMPANY NAME',
  address: 'THE COMPANY ADDRESS',
  status: 'ACTIVE',
  IsActive: true
}

const fakeAccountData = {
  companyNumber: fakeCompanyData.companyNumber,
  name: fakeCompanyData.name
}

let fakeContacts

lab.beforeEach(() => {
  fakeContacts = [
    new Contact({
      id: 'CONTACT_1_ID',
      firstName: 'CONTACT_1_FIRST_NAME',
      lastName: 'CONTACT_1_LAST_NAME',
      telephone: 'CONTACT_1_TELEPHONE',
      email: 'CONTACT_1_EMAIL',
      dob: {
        day: undefined,
        month: 1,
        year: 1970
      }
    }),
    new Contact({
      id: 'CONTACT_2_ID',
      firstName: 'CONTACT_2_FIRST_NAME',
      lastName: 'CONTACT_2_LAST_NAME',
      telephone: 'CONTACT_2_TELEPHONE',
      email: 'CONTACT_2_EMAIL',
      dob: {
        day: undefined,
        month: 2,
        year: 1971
      }
    }),
    new Contact({
      id: 'CONTACT_3_ID',
      firstName: 'CONTACT_3_FIRST_NAME',
      lastName: 'CONTACT_3_LAST_NAME',
      telephone: 'CONTACT_3_TELEPHONE',
      email: 'CONTACT_3_EMAIL',
      dob: {
        day: undefined,
        month: 3,
        year: 1972
      }
    })
  ]

  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  applicationGetByIdStub = Account.getByApplicationId
  Account.getByApplicationId = () => new Account(fakeAccountData)

  contactListStub = Contact.list
  Contact.list = () => fakeContacts

  contactSaveStub = Contact.prototype.save
  Contact.prototype.save = () => undefined

  applicationContactGetStub = ApplicationContact.get
  ApplicationContact.get = () => undefined

  applicationContactSaveStub = ApplicationContact.prototype.save
  ApplicationContact.prototype.save = () => undefined
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  Account.getByApplicationId = applicationGetByIdStub
  Contact.list = contactListStub
  Contact.prototype.save = contactSaveStub
  ApplicationContact.get = applicationContactGetStub
  ApplicationContact.prototype.save = applicationContactSaveStub
})

const checkPageElements = async (request, expectedPageHeading, expectedValues) => {
  const res = await server.inject(request)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(expectedPageHeading)

  const elementIds = [
    'back-link',
    'defra-csrf-token',
    'dob-explanation',
    'dob-visually-hidden',
    'dates-of-birth'
  ]
  for (let id of elementIds) {
    Code.expect(doc.getElementById(id)).to.exist()
  }

  // Check the director rows
  let index = 0
  for (let expectedValue of expectedValues) {
    element = doc.getElementById(`director-list-item-${index}`)
    Code.expect(element).to.exist()

    element = doc.getElementById(`director-name-${index}`)
    Code.expect(element).to.exist()

    element = doc.getElementById(`visually-hidden-label-${index}`)
    Code.expect(element).to.exist()

    element = doc.getElementById(`dob-formatted-month-year-${index}`)
    Code.expect(element).to.exist()

    element = doc.getElementById(`director-dob-day-${index}`)
    Code.expect(element.getAttribute('value')).to.equal(expectedValue)

    index++
  }

  // Check for the 'no data' message (if there is one)
  if (expectedValues.length === 0) {
    element = doc.getElementById(`no-directors`)
    Code.expect(element).to.exist()
  }

  element = doc.getElementById('submit-button').firstChild
  Code.expect(element.nodeValue).to.equal('Continue')
}

const checkValidationError = async (field, expectedErrorMessage) => {
  const res = await server.inject(postRequest)
  Code.expect(res.statusCode).to.equal(200)

  const parser = new DOMParser()
  const doc = parser.parseFromString(res.payload, 'text/html')

  let element

  // Panel summary error item
  element = doc.getElementById('error-summary-list-item-0').firstChild
  Code.expect(element.nodeValue).to.equal(expectedErrorMessage)

  // Director DOB Day error
  if (field) {
    Code.expect(doc.getElementById(`${field}`).getAttribute('class')).contains('form-control-error')
    element = doc.getElementById(`${field}-error`).firstChild.firstChild
    Code.expect(element.nodeValue).to.equal(expectedErrorMessage)
  }
}

lab.experiment('Director Date Of Birth page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the Director DOB page correctly when there are no Directors`, async () => {
      // Empty site name response
      Contact.list = () => []
      await checkPageElements(getRequest, singleDirectorPageHeading, [])
    })

    lab.test(`GET ${routePath} returns the Director DOB page correctly for a single Director`, async () => {
      // Empty site name response
      Contact.list = () => [fakeContacts[0]]
      await checkPageElements(getRequest, singleDirectorPageHeading, [''])
    })

    lab.test(`GET ${routePath} returns the Director DOB page correctly for multiple Directors`, async () => {
      checkPageElements(getRequest, multipleDirectorPageHeading, ['', '', ''])
    })

    lab.test(`GET ${routePath} returns the Director DOB page correctly for multiple Directors with existing data`, async () => {
      fakeContacts[0].dob.day = 10
      fakeContacts[1].dob.day = 20
      fakeContacts[2].dob.day = 30
      await checkPageElements(getRequest, multipleDirectorPageHeading, ['10', '20', '30'])
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} forwards to the next route`, async () => {
        postRequest.payload['director-dob-day-0'] = '10'
        postRequest.payload['director-dob-day-1'] = '20'
        postRequest.payload['director-dob-day-2'] = '30'

        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} with no DOBs entered displays the correct error message`, async () => {
        await checkValidationError(undefined, 'Enter a date of birth')
      })

      lab.test(`POST ${routePath} with a missing day of birth entered displays the correct error message`, async () => {
        postRequest.payload['director-dob-day-0'] = '10'
        // No day of birth for director-dob-day-1 (fakeContacts[1])
        postRequest.payload['director-dob-day-2'] = '30'
        await checkValidationError('director-dob-day-1', `Enter a date of birth for ${fakeContacts[1].firstName} ${fakeContacts[1].lastName}`)
      })

      lab.test(`POST ${routePath} with a invalid day of birth (31st Feb) displays the correct error message`, async () => {
        postRequest.payload['director-dob-day-0'] = '10'
        postRequest.payload['director-dob-day-2'] = '30'

        // Month is Feb therefore this should trigger a validation error
        postRequest.payload['director-dob-day-1'] = '31'
        await checkValidationError('director-dob-day-1', `Enter a day between 1 and 28 for ${fakeContacts[1].firstName} ${fakeContacts[1].lastName}`)
      })

      lab.test(`POST ${routePath} with a invalid integer for the day of birth ('XXX')  displays the correct error message`, async () => {
        postRequest.payload['director-dob-day-0'] = '10'
        postRequest.payload['director-dob-day-2'] = '30'

        // Day is not a valid integer therefore this should trigger a validation error
        postRequest.payload['director-dob-day-1'] = 'XXX'
        await checkValidationError('director-dob-day-1', `Enter a day between 1 and 28 for ${fakeContacts[1].firstName} ${fakeContacts[1].lastName}`)
      })
    })
  })
})
