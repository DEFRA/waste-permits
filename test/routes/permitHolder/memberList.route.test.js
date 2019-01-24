'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const CryptoService = require('../../../src/services/crypto.service')
const ContactDetail = require('../../../src/models/contactDetail.model')
const Application = require('../../../src/persistence/entities/application.entity')
const { capitalizeFirstLetter } = require('../../../src/utilities/utilities')
const { COOKIE_RESULT } = require('../../../src/constants')

let memberId = 'MEMBER_ID'
let memberView

const routes = {
  'partner': {
    heading: 'Business partners you have added to this application',
    routePath: `/permit-holder/partners/list`,
    nextPath: '/permit-holder/company/declare-offences',
    errorPath: '/errors/technical-problem',
    editMemberPath: `/permit-holder/partners/name/${memberId}`,
    deleteMemberPath: `/permit-holder/partners/delete/${memberId}`
  },
  'postholder': {
    heading: 'Postholders you have added',
    routePath: `/permit-holder/group/list`,
    nextPath: '/permit-holder/company/declare-offences',
    errorPath: '/errors/technical-problem',
    editMemberPath: `/permit-holder/group/post-holder/name/${memberId}`,
    deleteMemberPath: `/permit-holder/group/post-holder/delete/${memberId}`
  }
}

Object.entries(routes).forEach(([member, { heading, routePath, nextPath, errorPath, editMemberPath, deleteMemberPath }]) => {
  lab.experiment(capitalizeFirstLetter(member), () => {
    let mocks
    let sandbox

    lab.beforeEach(() => {
      mocks = new Mocks()

      mocks.contactDetailList = [mocks.contactDetail]
      const formatDate = (date) => date.split('-').reverse().map(val => val.padStart(2, '0')).join('/')

      memberView = {
        partnerId: memberId,
        name: `${mocks.contactDetail.firstName} ${mocks.contactDetail.lastName}`,
        email: mocks.contactDetail.email,
        telephone: mocks.contactDetail.telephone,
        dob: formatDate(mocks.contactDetail.dateOfBirth),
        changeLink: editMemberPath,
        deleteLink: deleteMemberPath,
        fullAddress: mocks.contactDetail.fullAddress
      }

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()

      // Stub methods
      sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
      sandbox.stub(CryptoService, 'encrypt').value(() => memberId)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(Application.prototype, 'save').value(() => mocks.application.id)
      sandbox.stub(ContactDetail, 'list').value(() => mocks.contactDetailList)
      sandbox.stub(ContactDetail.prototype, 'save').value(() => mocks.contactDetail.id)
      sandbox.stub(ContactDetail.prototype, 'delete').value(() => true)
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    lab.experiment(`List page tests:`, () => {
      new GeneralTestHelper({ lab, routePath }).test()

      const checkElements = async (doc, data) => {
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(heading)

        data.forEach(({ partnerId, name, email, telephone, dob, changeLink, deleteLink, fullAddress }, index) => {
          Code.expect(doc.getElementById(`member-${index}`)).to.exist()
          Code.expect(doc.getElementById(`member-name-${index}`).firstChild.nodeValue).to.equal(name)
          Code.expect(doc.getElementById(`member-address-${index}`).firstChild.nodeValue).to.equal(fullAddress)
          Code.expect(doc.getElementById(`member-email-${index}`).firstChild.nodeValue).to.equal(email)
          Code.expect(doc.getElementById(`member-telephone-${index}`).firstChild.nodeValue).to.equal(telephone)
          Code.expect(doc.getElementById(`member-dob-${index}`).firstChild.nodeValue).to.equal(dob)
          Code.expect(doc.getElementById(`member-change-${index}`).getAttribute('href')).to.equal(changeLink)
          Code.expect(doc.getElementById(`member-change-name-${index}`).firstChild.nodeValue).to.equal(name)
          Code.expect(doc.getElementById(`member-delete-${index}`).getAttribute('href')).to.equal(deleteLink)
          Code.expect(doc.getElementById(`member-delete-name-${index}`).firstChild.nodeValue).to.equal(name)
        })

        if (data.length > 1) {
          Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal(`All ${member}s added - continue`)
          Code.expect(doc.getElementById('add-another-member-link').getAttribute('href')).to.equal(`${routePath}/add`)
        } else {
          Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal(`Add another ${member}`)
          Code.expect(doc.getElementById('add-another-member-link')).to.not.exist()
        }

        Code.expect(doc.getElementById(`member-${data.length}`)).to.not.exist()
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

          lab.test(`Should redirect if there are no ${member}s`, async () => {
            mocks.contactDetailList = []
            const res = await server.inject(getRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(editMemberPath)
          })

          lab.test(`returns the contact page correctly for one ${member}`, async () => {
            const doc = await GeneralTestHelper.getDoc(getRequest)
            checkElements(doc, [memberView])
          })

          lab.test(`returns the contact page correctly for two ${member}s`, async () => {
            mocks.contactDetailList = [mocks.contactDetail, mocks.contactDetail]
            const doc = await GeneralTestHelper.getDoc(getRequest)
            checkElements(doc, [memberView, memberView])
          })

          lab.test(`returns the contact page correctly for three ${member}s`, async () => {
            mocks.contactDetailList = [mocks.contactDetail, mocks.contactDetail, mocks.contactDetail]
            const doc = await GeneralTestHelper.getDoc(getRequest)
            checkElements(doc, [memberView, memberView, memberView])
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
          lab.test(`redirects to ${nextPath} when currently there is one ${member}`, async () => {
            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(editMemberPath)
          })

          lab.test(`redirects to ${nextPath} when currently there are two ${member}s`, async () => {
            mocks.contactDetailList = [mocks.contactDetail, mocks.contactDetail]
            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(nextPath)
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
  })
})
