'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const Application = require('../../../src/models/application.model')
const Contact = require('../../../src/models/contact.model')
const AddressDetail = require('../../../src/models/addressDetail.model')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox

const routePath = '/permit-holder/contact-details'
const errorPath = '/errors/technical-problem'
const nextRoutePath = '/permit-holder/address/postcode'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest
let validContactDetails
let fakeContact
let fakePermitHolder
let fakeApplication
let fakeIndividualPermitHolderDetails
let fakeIndividualPermitHolderDetailsId = 'INDIVIDUAL_PERMIT_HOLDER_ID'

lab.beforeEach(() => {
  fakeContact = {
    id: 'CONTACT_ID',
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    email: 'EMAIL'
  }

  fakePermitHolder = {
    id: 'PERMIT_HOLDER_ID',
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    email: 'PERMIT_HOLDER_EMAIL'
  }

  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER',
    applicantType: 910400000,
    permitHolderIndividualId: fakeContact.id
  }

  validContactDetails = {
    'email': 'test@test.com',
    'telephone': '01234567890'
  }

  fakeIndividualPermitHolderDetails = {
    id: fakeIndividualPermitHolderDetailsId
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
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(Contact, 'getIndividualPermitHolderByApplicationId').value(() => new Contact(fakePermitHolder))
  sandbox.stub(Contact, 'getByFirstnameLastnameEmail').value(() => fakeContact ? new Contact(fakeContact) : undefined)
  sandbox.stub(Contact.prototype, 'save').value(() => {})
  sandbox.stub(AddressDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(AddressDetail, 'getIndividualPermitHolderDetails').value(() => new AddressDetail(fakeIndividualPermitHolderDetails))
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
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment('GET:', () => {
    lab.test(`GET ${routePath} returns the permit holder contact details page correctly when it is a new application`, async () => {
      fakePermitHolder = {}
      checkPageElements(getRequest, '', '')
    })

    lab.test(`GET ${routePath} returns the permit holder contact details page correctly when it is a new application where the permit holder exists`, async () => {
      const { email } = fakePermitHolder
      checkPageElements(getRequest, email, '')
    })
  })

  lab.experiment('POST:', () => {
    lab.experiment('Success:', () => {
      lab.experiment(`POST ${routePath} (new Permit Holder) redirects to the next route ${nextRoutePath}`, () => {
        let applicationSaveSpy
        let contactSaveSpy

        lab.beforeEach(() => {
          applicationSaveSpy = sinon.spy(Application.prototype, 'save')
          contactSaveSpy = sinon.spy(Contact.prototype, 'save')
        })

        lab.afterEach(() => {
          applicationSaveSpy.restore()
          contactSaveSpy.restore()
        })

        lab.test(`when the permit holder is not the matching contact`, async () => {
          const res = await server.inject(postRequest)
          Code.expect(applicationSaveSpy.callCount).to.equal(1)
          Code.expect(contactSaveSpy.callCount).to.equal(0)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })

        lab.test(`when the permit holder is the matching contact`, async () => {
          fakePermitHolder = fakeContact
          const res = await server.inject(postRequest)
          Code.expect(applicationSaveSpy.callCount).to.equal(0)
          Code.expect(contactSaveSpy.callCount).to.equal(0)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })

        lab.test(`when the matching contact doesn't exist`, async () => {
          fakeContact = undefined
          const res = await server.inject(postRequest)
          Code.expect(applicationSaveSpy.callCount).to.equal(1)
          Code.expect(contactSaveSpy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })
      })
    })

    lab.experiment('Failure:', () => {
      lab.experiment(`POST ${routePath} fails`, () => {
        lab.test(`when the application does not contain an individual permit holder`, async () => {
          const stub = sinon.stub(Contact, 'getIndividualPermitHolderByApplicationId').value(() => undefined)
          const logErrorSpy = sandbox.spy(LoggingService, 'logError')
          const res = await server.inject(postRequest)
          Code.expect(logErrorSpy.callCount).to.equal(1)
          stub.restore()
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(errorPath)
        })
      })
    })

    lab.experiment('Invalid:', () => {
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
