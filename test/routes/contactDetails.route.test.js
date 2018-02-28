'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/models/application.model')
const Account = require('../../src/models/account.model')
const AddressDetail = require('../../src/models/addressDetail.model')
const Contact = require('../../src/models/contact.model')
const ContactDetails = require('../../src/models/taskList/contactDetails.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let fakeApplication
let fakeAccount
let fakeContact
let fakeCompanySecretaryDetails
let fakePrimaryContactDetails

let validateCookieStub
let logErrorStub
let contactSaveStub
let contactGetByIdStub
let contactDetailsUpdateCompletenessStub
let applicationGetByIdStub
let applicationIsSubmittedStub
let applicationSaveStub
let accountGetByIdStub
let addressDetailGetCompanySecretaryDetailsStub
let addressDetailGetPrimaryContactDetailsStub
let addressDetailSaveStub

let fakeApplicationId = 'APPLICATION_ID'
let fakeContactId = 'CONTACT_ID'
let fakeAccountId = 'ACCOUNT_ID'
let fakeCompanySecretaryDetailsId = 'COMPANY_SECRETARY_DETAILS_ID'
let fakePrimaryContactDetailsId = 'PRIMARY_CONTACT_DETAILS_ID'

let validPayload

const routePath = '/contact-details'
const nextRoutePath = '/task-list'

lab.beforeEach(() => {
  fakeApplication = {
    id: fakeApplicationId,
    contactId: fakeContactId,
    accountId: fakeAccountId
  }
  fakeAccount = {
    id: fakeAccountId,
    name: 'Agent'
  }
  fakeCompanySecretaryDetails = {
    id: fakeCompanySecretaryDetailsId,
    email: 'fred.james@email.com'
  }
  fakePrimaryContactDetails = {
    id: fakePrimaryContactDetailsId,
    telephone: '01234567890'
  }
  fakeContact = {
    id: fakeContactId,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com'
  }

  validPayload = {
    'first-name': fakeContact.firstName,
    'last-name': fakeContact.lastName,
    'telephone': fakePrimaryContactDetails.telephone,
    'email': fakeContact.email,
    'company-secretary-email': fakeCompanySecretaryDetails.email
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  accountGetByIdStub = Account.getById
  Account.getById = () => new Account(fakeAccount)

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplication)

  applicationIsSubmittedStub = Application.prototype.isSubmitted
  Application.prototype.isSubmitted = () => false

  applicationSaveStub = Application.prototype.save
  Application.prototype.save = () => {}

  addressDetailGetCompanySecretaryDetailsStub = AddressDetail.getCompanySecretaryDetails
  AddressDetail.getCompanySecretaryDetails = () => new AddressDetail(fakeCompanySecretaryDetails)

  addressDetailGetPrimaryContactDetailsStub = AddressDetail.getPrimaryContactDetails
  AddressDetail.getPrimaryContactDetails = () => new AddressDetail(fakePrimaryContactDetails)

  addressDetailSaveStub = AddressDetail.save
  AddressDetail.prototype.save = () => {}

  contactGetByIdStub = Contact.getById
  Contact.getById = () => new Contact(fakeContact)

  contactSaveStub = Contact.prototype.save
  Contact.prototype.save = () => {}

  contactDetailsUpdateCompletenessStub = ContactDetails.updateCompleteness
  ContactDetails.updateCompleteness = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  Account.getById = accountGetByIdStub
  AddressDetail.getCompanySecretaryDetails = addressDetailGetCompanySecretaryDetailsStub
  AddressDetail.getPrimaryContactDetails = addressDetailGetPrimaryContactDetailsStub
  AddressDetail.save = addressDetailSaveStub
  Application.getById = applicationGetByIdStub
  Application.prototype.isSubmitted = applicationIsSubmittedStub
  Application.save = applicationSaveStub
  Contact.getById = contactGetByIdStub
  Contact.save = contactSaveStub
  ContactDetails.updateCompleteness = contactDetailsUpdateCompletenessStub
})

lab.experiment('Contact details page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(false, false, false)

  lab.experiment(`GET ${routePath}`, () => {
    let request
    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('The page should have a back link', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })

    lab.test('returns the contact page correctly', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Who should we contact about this application?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
      Code.expect(doc.getElementById('privacy-link').getAttribute('href')).to.equal('/information/privacy')

      // Test for the existence of expected static content
      const elementIds = [
        'first-name-label',
        'last-name-label',
        'is-contact-an-agent-label',
        'agent-company-label',
        'telephone-label',
        'telephone-hint',
        'email-heading',
        'email-label',
        'email-hint',
        'company-secretary-email-label',
        'company-secretary-email-hint',
        'company-secretary-email-summary',
        'company-secretary-email-description']

      elementIds.forEach((id) => Code.expect(doc.getElementById(id)).to.exist())
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let request
    const getDoc = async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      return parser.parseFromString(res.payload, 'text/html')
    }

    lab.beforeEach(() => {
      request = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: validPayload
      }
    })

    lab.experiment('success', () => {
      lab.test('redirects to the Task List route after a CREATE', async () => {
        // TODO Ensure that this is a CREATE
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })

      lab.test('redirects to the Task List route after an UPDATE', async () => {
        // TODO Ensure that this is an UPDATE
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      // Test that all and only the expected messages are present for each field when an invalid value has been enetered.
      const checkErrorMessages = (doc, field, messages) => {
        const summaryMessages = []
        for (let index = 0, listItem; (listItem = doc.getElementById(`error-summary-list-item-${index}`)); index++) {
          summaryMessages.push(listItem.firstChild.nodeValue)
        }
        Code.expect(summaryMessages).to.equal(messages)

        Code.expect(doc.getElementById(`${field}`).getAttribute('class')).contains('form-control-error')
        const fieldErrors = doc.getElementById(`${field}-error`).childNodes
        const fieldMessages = []
        for (let index = 0; index < fieldErrors.length; index++) {
          fieldMessages.push(fieldErrors[index].firstChild.nodeValue)
        }
        Code.expect(fieldMessages).to.equal(messages)
      }

      const fieldErrorTests = [
        {
          field: 'first-name',
          value: '',
          messages: [
            'Enter a first name'
          ]
        },
        {
          field: 'first-name',
          value: 'fred@james-',
          messages: [
            'First name can only include letters, hyphens and apostrophes - delete any other characters',
            'First name can’t start or end with a dash - delete the dash']
        },
        {
          field: 'first-name',
          value: '7',
          messages: [
            'First name must have at least two letters - if you entered an initial please enter a name',
            'First name can only include letters, hyphens and apostrophes - delete any other characters']
        },
        {
          field: 'first-name',
          value: `_${'a'.repeat(50)}`,
          messages: [
            'Enter a shorter first name with no more than 50 characters',
            'First name can only include letters, hyphens and apostrophes - delete any other characters']
        },
        {
          field: 'last-name',
          value: '',
          messages: ['Enter a last name']
        },
        {
          field: 'last-name',
          value: 'fred!james-',
          messages: [
            'Last name can only include letters, hyphens and apostrophes - delete any other characters',
            'Last name can’t start or end with a dash - delete the dash']
        },
        {
          field: 'last-name',
          value: '723423gjhg4jkhjk3t378i3qgfiukhkufhf4',
          messages: ['Last name can only include letters, hyphens and apostrophes - delete any other characters']
        },
        {
          field: 'last-name',
          value: '+'.repeat(51),
          messages: [
            'Enter a shorter last name with no more than 50 characters',
            'Last name can only include letters, hyphens and apostrophes - delete any other characters']
        },
        {
          field: 'telephone',
          value: '',
          messages: ['Enter a telephone number']
        },
        {
          field: 'telephone',
          value: '+0',
          messages: [
            'The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0',
            'That telephone number is too short. It should have at least 10 characters. Make sure you include the area code.']
        },
        {
          field: 'telephone',
          value: '!',
          messages: [
            'Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.',
            'That telephone number is too short. It should have at least 10 characters. Make sure you include the area code.']
        },
        {
          field: 'telephone',
          value: '+0456   5 56 45 64      4 44',
          messages: [
            'The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0']
        },
        {
          field: 'telephone',
          value: '+145600050560450640000004044',
          messages: [
            'That telephone number is too long. It should have no more than 15 characters.']
        },
        {
          field: 'telephone',
          value: '6876867+',
          messages: [
            'The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0',
            'That telephone number is too short. It should have at least 10 characters. Make sure you include the area code.']
        },
        {
          field: 'email',
          value: '',
          messages: ['Enter an email address for the main contact']
        },
        {
          field: 'email',
          value: 'farm manager@hilltopfarming.co.uk',
          messages: ['Enter a valid email address for the main contact']
        },
        {
          field: 'company-secretary-email',
          value: '',
          messages: ['Enter an email address for the Company Secretary or a director']
        },
        {
          field: 'company-secretary-email',
          value: 'john"hardman"harding@securityguards.com',
          messages: ['Enter a valid email address for the Company Secretary or director']
        },
        {
          field: 'agent-company',
          value: '',
          isAgent: true,
          messages: ['Enter the agent’s trading, business or company name']
        },
        {
          field: 'agent-company',
          value: 'a'.repeat(161),
          isAgent: true,
          messages: ['Enter a shorter trading, business or company name with no more than 160 characters']
        }]
      fieldErrorTests.forEach(({field, value, messages, isAgent}) => {
        lab.test(`error messages when ${field} has a value of "${value}"`, async () => {
          request.payload[field] = value
          if (isAgent) {
            request.payload['is-contact-an-agent'] = 'on'
          }
          const doc = await getDoc()
          checkErrorMessages(doc, field, messages)
        })
      })
    })
  })
})
