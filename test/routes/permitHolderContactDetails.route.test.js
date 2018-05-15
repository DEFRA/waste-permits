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
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

const routePath = '/permit-holder/contact-details'
const nextRoutePath = '/permit-holder/address/postcode'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest
let validContactDetails

const fakeApplication = {
  id: 'APPLICATION_ID',
  applicationName: 'APPLICATION_NAME'
}

lab.beforeEach(() => {
  validContactDetails = {
    'email': 'test@test.com',
    'telephone': '01234567890'
  }

  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {},
    payload: validContactDetails
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
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedEmail, expectedTelephone) => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What are the permit holder's contact details?`)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'back-link',
    'defra-csrf-token',
    'email',
    'telephone'
  ])

  element = doc.getElementById('email')
  Code.expect(element.getAttribute('value')).to.equal(expectedEmail)

  element = doc.getElementById('telephone')
  Code.expect(element.getAttribute('value')).to.equal(expectedTelephone)

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

lab.experiment('Permit Holder Contact Details page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the permit holder contact details page correctly when it is a new application`, async () => {
      checkPageElements(getRequest, '', '')
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.test(`POST ${routePath} (new Permit Holder) redirects to the next route ${nextRoutePath}`, async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })      
    })

    lab.experiment('Failure:', () => {
      lab.test(`POST ${routePath} shows an error message when the email is blank`, async () => {
        postRequest.payload['email'] = ''
        await checkValidationErrors('email', ['Enter an email address'])
      })

      lab.test(`POST ${routePath} shows an error message when the email has an invalid format`, async () => {
        postRequest.payload['email'] = 'INVALID_EMAIL'
        await checkValidationErrors('email', ['Enter a valid email address'])
      })

      lab.test(`POST ${routePath} shows an error message when the telephone is blank`, async () => {
        postRequest.payload['telephone'] = ''
        await checkValidationErrors('telephone', ['Enter a telephone number'])
      })

      lab.test(`POST ${routePath} shows an error message when the telephone contains invalid characters`, async () => {
        postRequest.payload['telephone'] = '0123456789A'
        await checkValidationErrors('telephone', ['Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.'])
      })

      lab.test(`POST ${routePath} shows multiple error messages on the telephone field`, async () => {
        postRequest.payload['telephone'] = '+0123456789A'
        const expectedErrors = [
          'Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.',
          'The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0'
        ]
        await checkValidationErrors('telephone', expectedErrors)
      })      
    })
  })
})
