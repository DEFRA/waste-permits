'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/persistence/entities/application.entity')
const ContactDetail = require('../../src/models/contactDetail.model')
const RecoveryService = require('../../src/services/recovery.service')
const ContactDetails = require('../../src/models/taskList/contactDetails.task')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

let fakeApplication
let fakeContactDetail
let fakeRecovery

let fakeApplicationId = 'APPLICATION_ID'
let fakeContactId = 'CONTACT_ID'

let validPayload

const routePath = '/invoice/contact'
const nextRoutePath = '/task-list'

lab.beforeEach(() => {
  fakeApplication = {
    id: fakeApplicationId,
    contactId: fakeContactId
  }

  fakeContactDetail = {
    firstName: 'John',
    lastName: 'Smith',
    telephone: '+ 12  012 3456 7890',
    email: 'john.smith@email.com'
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    application: new Application(fakeApplication)
  })

  validPayload = {
    'first-name': fakeContactDetail.firstName,
    'last-name': fakeContactDetail.lastName,
    'telephone': fakeContactDetail.telephone,
    'email': fakeContactDetail.email
  }
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(fakeContactDetail))
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(ContactDetails, 'updateCompleteness').value(() => {})
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Contact details page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

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
      const doc = await GeneralTestHelper.getDoc(request)

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })

    lab.test('returns the contact page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(request)

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Who should we contact about invoicing or payments?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'first-name-label',
        'last-name-label',
        'telephone-label',
        'telephone-hint',
        'email-label',
        'email-hint'
      ])
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let request

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
            'First name cannot start or end with a dash - delete the dash']
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
            'Last name cannot start or end with a dash - delete the dash']
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
          messages: ['Enter a valid telephone number']
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
            'That telephone number is too long. It should have no more than 17 digits.']
        },
        {
          field: 'telephone',
          value: '+1456123                                                            4044',
          messages: [
            'That telephone number is too long. It should have no more than 30 characters.']
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
          messages: ['Enter a valid email address']
        },
        {
          field: 'email',
          value: 'farm manager@hilltopfarming.co.uk',
          messages: ['Enter a valid email address']
        }]
      fieldErrorTests.forEach(({ field, value, messages, isAgent }) => {
        lab.test(`error messages when ${field} has a value of "${value}"`, async () => {
          request.payload[field] = value
          const doc = await GeneralTestHelper.getDoc(request)
          checkErrorMessages(doc, field, messages)
        })
      })
    })
  })
})