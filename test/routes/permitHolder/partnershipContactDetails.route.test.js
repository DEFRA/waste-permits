'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const CryptoService = require('../../../src/services/crypto.service')
const Account = require('../../../src/models/account.model')
const Application = require('../../../src/models/application.model')
const Contact = require('../../../src/models/contact.model')
const AddressDetail = require('../../../src/models/addressDetail.model')
const ApplicationContact = require('../../../src/models/applicationContact.model')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox
let fakePartnershipId = 'PARTNERSHIP_ID'

const routePath = `/permit-holder/partners/details/${fakePartnershipId}`
const errorPath = '/errors/technical-problem'
const nextRoutePath = `/permit-holder/partners/address/postcode/${fakePartnershipId}`

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {}
}
let postRequest
let validContactDetails
let fakeContact
let fakePermitHolder
let fakeRecovery
let fakeAccount
let fakeAddressDetail
let fakeApplication
let fakeApplicationContact

lab.beforeEach(() => {
  fakeAccount = {
    id: 'Account_ID'
  }

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

  validContactDetails = {
    'email': 'test@test.com',
    'telephone': '01234567890'
  }

  fakeAddressDetail = {
    id: 'ADDRESS_DETAIL_ID',
    email: validContactDetails.email,
    telephone: validContactDetails.telephone
  }

  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER'
  }

  fakeApplicationContact = {
    id: 'APPLICATION_CONTACT_ID',
    applicationId: fakeApplication.id,
    contactId: fakeContact.id
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    application: new Application(fakeApplication),
    account: new Account(fakeAccount)
  })

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
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(CryptoService, 'decrypt').value(() => fakeApplicationContact.id)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(ApplicationContact, 'getById').value(() => new ApplicationContact(fakeApplicationContact))
  sandbox.stub(ApplicationContact, 'listByApplicationId').value(() => [new ApplicationContact(fakeApplicationContact)])
  sandbox.stub(ApplicationContact.prototype, 'save').value(() => {})
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(Contact, 'getByFirstnameLastnameEmail').value(() => fakePermitHolder ? new Contact(fakePermitHolder) : undefined)
  sandbox.stub(Contact.prototype, 'listLinked').value(() => [new Account(fakeAccount)])
  sandbox.stub(Contact.prototype, 'save').value(() => {})
  sandbox.stub(AddressDetail, 'getPartnerDetails').value(() => new AddressDetail(fakeAddressDetail))
  sandbox.stub(AddressDetail.prototype, 'save').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, expectedEmail, expectedTelephone, name) => {
  const doc = await GeneralTestHelper.getDoc(request)

  let element = doc.getElementById('page-heading').firstChild
  Code.expect(element.nodeValue).to.equal(`What are the contact details for ${name}?`)

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

lab.experiment('Partner Contact Details page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`Get ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test(`when returns the partnership contact details page correctly when it is a new application`, async () => {
        fakeAddressDetail = {}
        const { firstName, lastName } = fakeContact
        checkPageElements(getRequest, '', '', `${firstName} ${lastName}`)
      })

      lab.test(`when returns the partnership contact details page correctly when it is a new application where the partner exists`, async () => {
        const { email, telephone } = fakeAddressDetail
        const { firstName, lastName } = fakeContact
        checkPageElements(getRequest, email, telephone, `${firstName} ${lastName}`)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`when the applicationContact does not exist`, async () => {
        const stub = sinon.stub(ApplicationContact, 'getById').value(() => undefined)
        const res = await server.inject(getRequest)
        stub.restore()
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.experiment(`(new Partner) redirects to the next route ${nextRoutePath}`, () => {
        let applicationContactSaveSpy
        let addressDetailSaveSpy

        lab.beforeEach(() => {
          applicationContactSaveSpy = sinon.spy(ApplicationContact.prototype, 'save')
          addressDetailSaveSpy = sinon.spy(AddressDetail.prototype, 'save')
        })

        lab.afterEach(() => {
          applicationContactSaveSpy.restore()
          addressDetailSaveSpy.restore()
        })

        lab.test(`when the partner is not the matching contact`, async () => {
          const res = await server.inject(postRequest)
          Code.expect(applicationContactSaveSpy.callCount).to.equal(1)
          Code.expect(addressDetailSaveSpy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })

        lab.test(`when the partner is the matching contact`, async () => {
          fakePermitHolder = fakeContact
          const res = await server.inject(postRequest)
          Code.expect(applicationContactSaveSpy.callCount).to.equal(0)
          Code.expect(addressDetailSaveSpy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })

        lab.test(`when the matching contact doesn't exist`, async () => {
          fakeContact = undefined
          const res = await server.inject(postRequest)
          Code.expect(applicationContactSaveSpy.callCount).to.equal(1)
          Code.expect(addressDetailSaveSpy.callCount).to.equal(1)
          Code.expect(res.statusCode).to.equal(302)
          Code.expect(res.headers['location']).to.equal(nextRoutePath)
        })
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`when the applicationContact does not exist`, async () => {
        const stub = sinon.stub(ApplicationContact, 'getById').value(() => undefined)
        const logErrorSpy = sandbox.spy(LoggingService, 'logError')
        const res = await server.inject(postRequest)
        Code.expect(logErrorSpy.callCount).to.equal(1)
        stub.restore()
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })

    lab.experiment('Invalid:', () => {
      lab.test(`shows an error message when the email is blank`, async () => {
        postRequest.payload['email'] = ''
        await checkValidationErrors('email', ['Enter an email address'])
      })

      lab.test(`shows an error message when the email has an invalid format`, async () => {
        postRequest.payload['email'] = 'INVALID_EMAIL'
        await checkValidationErrors('email', ['Enter a valid email address'])
      })

      lab.test(`shows an error message when the telephone is blank`, async () => {
        postRequest.payload['telephone'] = ''
        await checkValidationErrors('telephone', ['Enter a telephone number'])
      })

      lab.test(`shows an error message when the telephone contains invalid characters`, async () => {
        postRequest.payload['telephone'] = '0123456789A'
        await checkValidationErrors('telephone', ['Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.'])
      })

      lab.test(`shows multiple error messages on the telephone field`, async () => {
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
