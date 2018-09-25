'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/models/application.model')
const AddressDetail = require('../../src/models/addressDetail.model')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

let fakeApplication
let fakeCompanySecretaryDetails

let fakeApplicationId = 'APPLICATION_ID'
let fakeContactId = 'CONTACT_ID'
let fakeAccountId = 'ACCOUNT_ID'
let fakeCompanySecretaryDetailsId = 'COMPANY_SECRETARY_DETAILS_ID'

let validPayload

const routePath = '/permit-holder/company/director-email'
const nextRoutePath = '/permit-holder/company/declare-offences'

lab.beforeEach(() => {
  fakeApplication = {
    id: fakeApplicationId,
    contactId: fakeContactId,
    agentId: fakeAccountId
  }

  fakeCompanySecretaryDetails = {
    id: fakeCompanySecretaryDetailsId,
    email: 'fred.james@email.com'
  }

  validPayload = {
    email: fakeCompanySecretaryDetails.email
  }
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(AddressDetail, 'getCompanySecretaryDetails').value(() => new AddressDetail(fakeCompanySecretaryDetails))
  sandbox.stub(AddressDetail.prototype, 'save').value(() => {})
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

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('What is the email address for the Company Secretary or a director?')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'director-email-paragraph-1',
        'director-email-paragraph-2',
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
      lab.test('redirects to the Task List route', async () => {
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
          field: 'email',
          value: '',
          messages: ['Enter a valid email address']
        },
        {
          field: 'email',
          value: 'john"hardman"harding@securityguards.com',
          messages: ['Enter a valid email address']
        }]
      fieldErrorTests.forEach(({ field, value, messages }) => {
        lab.test(`error messages when ${field} has a value of "${value}"`, async () => {
          request.payload[field] = value
          const doc = await GeneralTestHelper.getDoc(request)
          checkErrorMessages(doc, field, messages)
        })
      })
    })
  })
})
