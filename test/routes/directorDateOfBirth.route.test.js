'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const Account = require('../../src/models/account.model')
const Application = require('../../src/models/application.model')
const ApplicationContact = require('../../src/models/applicationContact.model')
const Contact = require('../../src/models/contact.model')
const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

const routes = {
  'Limited Company': {
    singleDirectorPageHeading: `What is the director's date of birth?`,
    multipleDirectorPageHeading: `What are the directors' dates of birth?`,
    routePath: '/permit-holder/company/director-date-of-birth',
    nextPath: '/permit-holder/company/director-email',
    errorPath: '/errors/technical-problem'
  },
  'Limited Liability Partnership': {
    singleDirectorPageHeading: `What is the member's date of birth?`,
    multipleDirectorPageHeading: `What are the members' dates of birth?`,
    pageHeading: 'What is the company number for the  limited liability partnership?',
    routePath: '/permit-holder/limited-liability-partnership/member-date-of-birth',
    nextPath: '/permit-holder/limited-liability-partnership/designated-member-email',
    errorPath: '/errors/technical-problem'
  }
}

Object.entries(routes).forEach(([companyType, { singleDirectorPageHeading, multipleDirectorPageHeading, routePath, nextPath }]) => {
  lab.experiment(companyType, () => {
    let getRequest
    let postRequest

    let fakeCompanyData
    let fakeApplication
    let fakeAccountData
    let fakeContacts
    let fakeCompanies
    let fakeRecovery

    lab.beforeEach(() => {
      fakeCompanyData = {
        name: 'THE COMPANY NAME',
        address: 'THE COMPANY ADDRESS',
        status: 'ACTIVE',
        IsActive: true
      }

      fakeApplication = {
        id: 'APPLICATION_ID',
        applicationNumber: 'APPLICATION_NUMBER'
      }

      fakeAccountData = {
        companyNumber: fakeCompanyData.companyNumber,
        name: fakeCompanyData.name
      }

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

      fakeCompanies = [
        new Account({ companyName: 'COMPANY_NAME_1' }),
        new Account({ companyName: 'COMPANY_NAME_2' }),
        new Account({ companyName: 'COMPANY_NAME_3' })
      ]

      fakeRecovery = () => ({
        authToken: 'AUTH_TOKEN',
        applicationId: fakeApplication.id,
        application: new Application(fakeApplication),
        account: new Account(fakeAccountData)
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
      sandbox.stub(Account.prototype, 'listLinked').value(() => fakeCompanies)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(ApplicationContact, 'get').value(() => undefined)
      sandbox.stub(ApplicationContact.prototype, 'save').value(() => undefined)
      sandbox.stub(Contact, 'list').value(() => fakeContacts)
      sandbox.stub(Contact.prototype, 'save').value(() => undefined)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    const checkPageElements = async (request) => {
      const expectedPageHeading = fakeContacts.length > 1 ? multipleDirectorPageHeading : singleDirectorPageHeading
      const doc = await GeneralTestHelper.getDoc(request)

      let element = doc.getElementById('page-heading').firstChild
      Code.expect(element.nodeValue).to.equal(expectedPageHeading)

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'back-link',
        'defra-csrf-token',
        'dob-explanation',
        'dob-visually-hidden',
        'dates-of-birth'
      ])

      // Check the director rows
      fakeContacts.forEach((contact, index) => {
        element = doc.getElementById(`director-list-item-${index}`)
        Code.expect(element).to.exist()

        element = doc.getElementById(`director-name-${index}`)
        Code.expect(element).to.exist()

        element = doc.getElementById(`label-${index}`)
        Code.expect(element).to.exist()

        element = doc.getElementById(`dob-formatted-month-year-${index}`)
        Code.expect(element).to.exist()

        element = doc.getElementById(`director-dob-day-${index}`)
        const { day = '' } = contact.dob
        Code.expect(element.getAttribute('value')).to.equal(`${day}`)
      })

      // Check the company rows
      fakeCompanies.forEach((company, index) => {
        element = doc.getElementById(`company-list-item-${index}`)
        Code.expect(element).to.exist()

        element = doc.getElementById(`company-name-${index}`)
        Code.expect(element).to.exist()
      })

      // Check for the 'no data' message (if there is one)
      if (fakeContacts.length + fakeCompanies.length === 0) {
        element = doc.getElementById(`no-directors`)
        Code.expect(element).to.exist()
      }

      element = doc.getElementById('submit-button').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')
    }

    const checkValidationError = async (field, expectedErrorMessage) => {
      const doc = await GeneralTestHelper.getDoc(postRequest)

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
      new GeneralTestHelper({ lab, routePath }).test()

      lab.experiment(`GET ${routePath} returns the Director DOB page correctly`, () => {
        lab.test(`when there are no Directors or Companies`, async () => {
          // Empty site name response
          fakeContacts = []
          fakeCompanies = []
          await checkPageElements(getRequest)
        })

        lab.test(`for a single Director and no Companies`, async () => {
          // Empty site name response
          fakeContacts = [new Contact(fakeContacts[0])]
          fakeCompanies = []
          await checkPageElements(getRequest)
        })

        lab.test(`for a single Company and no Directors`, async () => {
          // Empty site name response
          fakeContacts = [new Contact(fakeContacts[0])]
          fakeCompanies = []
          await checkPageElements(getRequest)
        })

        lab.test(`for multiple Directors and no Companies`, async () => {
          fakeCompanies = []
          await checkPageElements(getRequest)
        })

        lab.test(`multiple Directors with existing data`, async () => {
          fakeContacts[0].dob.day = 10
          fakeContacts[1].dob.day = 20
          fakeContacts[2].dob.day = 30
          await checkPageElements(getRequest)
        })

        lab.test(`for multiple Companies and no Directors`, async () => {
          fakeContacts = []
          await checkPageElements(getRequest)
        })

        lab.test(`for multiple Companies and Directors`, async () => {
          await checkPageElements(getRequest)
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
            Code.expect(res.headers['location']).to.equal(nextPath)
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
  })
})
