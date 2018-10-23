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
const ContactDetail = require('../../../src/models/contactDetail.model')
const Application = require('../../../src/persistence/entities/application.entity')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox
let fakePartnershipId = 'PARTNERSHIP_ID'

const routePath = '/permit-holder/partners/list'
const errorPath = '/errors/technical-problem'
const editPartnerPath = `/permit-holder/partners/name/${fakePartnershipId}`
const deletePartnerPath = `/permit-holder/partners/delete/${fakePartnershipId}`
const nextRoutePath = '/permit-holder/company/declare-offences'

let fakeRecovery
let fakeApplication
let fakeContactDetail
let fakeContactDetailList
let fakePartnerView

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakeContactDetail = {
    id: fakePartnershipId,
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    jobTitle: 'JOB_TITLE',
    email: 'EMAIL',
    dateOfBirth: '1999-11-23',
    telephone: 'TELEPHONE',
    fullAddress: 'FULL_ADDRESS'
  }

  fakeContactDetailList = () => [new ContactDetail(fakeContactDetail)]

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    application: new Application(fakeApplication)
  })

  fakePartnerView = {
    partnerId: fakePartnershipId,
    name: `${fakeContactDetail.firstName} ${fakeContactDetail.lastName}`,
    email: fakeContactDetail.email,
    telephone: fakeContactDetail.telephone,
    dob: fakeContactDetail.dateOfBirth.split('-').reverse().join('/'),
    changeLink: editPartnerPath,
    deleteLink: deletePartnerPath,
    fullAddress: fakeContactDetail.fullAddress
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
  sandbox.stub(CryptoService, 'encrypt').value(() => fakeContactDetail.id)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => fakeApplication.id)
  sandbox.stub(ContactDetail, 'list').value(() => fakeContactDetailList())
  sandbox.stub(ContactDetail.prototype, 'save').value(() => fakeContactDetail.id)
  sandbox.stub(ContactDetail.prototype, 'delete').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Partners List page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  const checkElements = async (doc, data) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Business partners you have added to this application')

    data.forEach(({ partnerId, name, email, telephone, dob, changeLink, deleteLink, fullAddress }, index) => {
      Code.expect(doc.getElementById(`partner-${index}`)).to.exist()
      Code.expect(doc.getElementById(`partner-name-${index}`).firstChild.nodeValue).to.equal(name)
      Code.expect(doc.getElementById(`partner-address-${index}`).firstChild.nodeValue).to.equal(fullAddress)
      Code.expect(doc.getElementById(`partner-email-${index}`).firstChild.nodeValue).to.equal(email)
      Code.expect(doc.getElementById(`partner-telephone-${index}`).firstChild.nodeValue).to.equal(telephone)
      Code.expect(doc.getElementById(`partner-dob-${index}`).firstChild.nodeValue).to.equal(dob)
      Code.expect(doc.getElementById(`partner-change-${index}`).getAttribute('href')).to.equal(changeLink)
      Code.expect(doc.getElementById(`partner-change-name-${index}`).firstChild.nodeValue).to.equal(name)
      Code.expect(doc.getElementById(`partner-delete-${index}`).getAttribute('href')).to.equal(deleteLink)
      Code.expect(doc.getElementById(`partner-delete-name-${index}`).firstChild.nodeValue).to.equal(name)
    })

    if (data.length > 1) {
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('All partners added - continue')
      Code.expect(doc.getElementById('add-another-partner-link').getAttribute('href')).to.equal(`${routePath}/add`)
    } else {
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Add another partner')
      Code.expect(doc.getElementById('add-another-partner-link')).to.not.exist()
    }

    Code.expect(doc.getElementById(`partner-${data.length}`)).to.not.exist()
  }

  lab.experiment('GET:', () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('The page should have a back link', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)

        const element = doc.getElementById('back-link')
        Code.expect(element).to.exist()
      })

      lab.test('Should redirect if there are no partners', async () => {
        fakeContactDetailList = () => []
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(editPartnerPath)
      })

      lab.test('returns the contact page correctly for one partner', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkElements(doc, [fakePartnerView])
      })

      lab.test('returns the contact page correctly for two partners', async () => {
        fakeContactDetailList = () => [
          new ContactDetail(fakeContactDetail),
          new ContactDetail(fakeContactDetail)
        ]
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkElements(doc, [fakePartnerView, fakePartnerView])
      })

      lab.test('returns the contact page correctly for three partners', async () => {
        fakeContactDetailList = () => [
          new ContactDetail(fakeContactDetail),
          new ContactDetail(fakeContactDetail),
          new ContactDetail(fakeContactDetail)
        ]
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkElements(doc, [fakePartnerView, fakePartnerView, fakePartnerView])
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })

  lab.experiment('POST:', () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test(`redirects to ${nextRoutePath} when currently there is one partner`, async () => {
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(editPartnerPath)
      })

      lab.test(`redirects to ${nextRoutePath} when currently there are two partners`, async () => {
        fakeContactDetailList = () => [
          new ContactDetail(fakeContactDetail),
          new ContactDetail(fakeContactDetail)
        ]
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(nextRoutePath)
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
