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
const AddressDetail = require('../../../src/models/addressDetail.model')
const Application = require('../../../src/models/application.model')
const ApplicationContact = require('../../../src/models/applicationContact.model')
const Contact = require('../../../src/models/contact.model')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.model')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox
let fakePartnershipId = 'PARTNERSHIP_ID'

const routePath = `/permit-holder/partners/delete/${fakePartnershipId}`
const errorPath = '/errors/technical-problem'
const nextRoutePath = `/permit-holder/partners/list`

let postRequest
let getRequest
let fakeAccount
let fakeContact
let fakeRecovery
let fakeAddressDetail
let fakeApplication
let fakeApplicationContact
let fakeApplicationContactList

lab.beforeEach(() => {
  fakeAccount = {
    id: 'Account_ID'
  }

  fakeContact = {
    id: 'CONTACT_ID',
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME'
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
    applicationLineId: 'APPLICATION_LINE_ID',
    application: new Application(fakeApplication),
    account: new Account(fakeAccount)
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
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(CryptoService, 'decrypt').value(() => fakeApplicationContact.id)
  sandbox.stub(AddressDetail, 'getPartnerDetails').value(() => new AddressDetail(fakeAddressDetail))
  sandbox.stub(AddressDetail.prototype, 'delete').value(() => undefined)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(ApplicationContact, 'getById').value(() => new ApplicationContact(fakeApplicationContact))
  sandbox.stub(ApplicationContact, 'listByApplicationId').value(() => fakeApplicationContactList())
  sandbox.stub(ApplicationContact.prototype, 'delete').value(() => undefined)
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(Contact.prototype, 'unLink').value(() => undefined)
  sandbox.stub(Contact.prototype, 'listLinked').value(() => [new Account(fakeAccount)])
  sandbox.stub(Contact.prototype, 'save').value(() => undefined)
  sandbox.stub(PermitHolderDetails, 'clearCompleteness').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const checkPageElements = async (request, name) => {
  const doc = await GeneralTestHelper.getDoc(request)

  Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`Confirm you want to delete ${name}`)

  // Test for the existence of expected static content
  GeneralTestHelper.checkElementsExist(doc, [
    'back-link',
    'defra-csrf-token'
  ])

  Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Delete this partner')
  Code.expect(doc.getElementById('skip-delete-partner-link').firstChild.nodeValue).to.equal('Do not delete')
  Code.expect(doc.getElementById('skip-delete-partner-link').getAttribute('href')).to.equal(nextRoutePath)
}

lab.experiment('Partner Delete page tests:', () => {
  new GeneralTestHelper(lab, routePath).test()

  lab.experiment(`Get ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test('when returns the page is displayed', async () => {
        delete fakeApplicationContact.contactId
        const { firstName, lastName } = fakeContact
        await checkPageElements(getRequest, `${firstName} ${lastName}`)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`when the applicationContact does not exist`, async () => {
        fakeApplicationContact = undefined
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test(`when the partner is deleted`, async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`when the applicationContact does not exist`, async () => {
        fakeApplicationContact = undefined
        const logErrorSpy = sandbox.spy(LoggingService, 'logError')
        const res = await server.inject(postRequest)
        Code.expect(logErrorSpy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
