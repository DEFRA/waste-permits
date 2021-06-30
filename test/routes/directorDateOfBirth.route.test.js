'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const Account = require('../../src/persistence/entities/account.entity')
const Application = require('../../src/persistence/entities/application.entity')
const ContactDetail = require('../../src/models/contactDetail.model')
const Contact = require('../../src/persistence/entities/contact.entity')
const { COOKIE_RESULT } = require('../../src/constants')
const { LIMITED_LIABILITY_PARTNERSHIP, LIMITED_COMPANY } = require('../../src/dynamics').PERMIT_HOLDER_TYPES

const routes = {
  'Limited Company': {
    singleDirectorPageHeading: 'What is the director\'s date of birth?',
    multipleDirectorPageHeading: 'What are the directors\' dates of birth?',
    permitHolderType: LIMITED_COMPANY,
    routePath: '/permit-holder/company/director-date-of-birth',
    nextPath: '/permit-holder/company/director-email'
  },
  'Limited Liability Partnership': {
    singleDirectorPageHeading: 'What is the member\'s date of birth?',
    multipleDirectorPageHeading: 'What are the members\' dates of birth?',
    permitHolderType: LIMITED_LIABILITY_PARTNERSHIP,
    pageHeading: 'What is the company number for the  limited liability partnership?',
    routePath: '/permit-holder/limited-liability-partnership/member-date-of-birth',
    nextPath: '/permit-holder/limited-liability-partnership/designated-member-email'
  }
}

Object.entries(routes).forEach(([companyType, { singleDirectorPageHeading, multipleDirectorPageHeading, permitHolderType, routePath, nextPath }]) => {
  lab.experiment(companyType, () => {
    let getRequest
    let postRequest

    let mocks
    let sandbox

    lab.beforeEach(() => {
      mocks = new Mocks()

      mocks.directors = ['/1/1970', '/2/1971', '/3/1973']
        .map((dateOfBirth) => {
          const [day, month, year] = dateOfBirth.split('/')
          return { ...mocks.contactDetail, ...{ dob: { day, month, year } } }
        })

      mocks.companies = Array(3)
        .fill({ ...mocks.companyData })

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
      sandbox.stub(Account.prototype, 'listLinked').value(() => mocks.companies)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(ContactDetail, 'get').value(() => undefined)
      sandbox.stub(ContactDetail, 'list').value(() => [])
      sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
      sandbox.stub(Contact, 'list').value(() => mocks.directors)
      sandbox.stub(Contact.prototype, 'save').value(() => undefined)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    const checkPageElements = async (request) => {
      const expectedPageHeading = mocks.directors.length > 1 ? multipleDirectorPageHeading : singleDirectorPageHeading
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
      mocks.directors.forEach((contact, index) => {
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
      mocks.companies.forEach((company, index) => {
        element = doc.getElementById(`company-list-item-${index}`)
        Code.expect(element).to.exist()

        element = doc.getElementById(`company-name-${index}`)
        Code.expect(element).to.exist()
      })

      // Check for the 'no data' message (if there is one)
      if (mocks.directors.length + mocks.companies.length === 0) {
        element = doc.getElementById('no-directors')
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
        lab.test('when there are no Directors or Companies', async () => {
          // Empty site name response
          mocks.directors = []
          mocks.companies = []
          await checkPageElements(getRequest)
        })

        lab.test('for a single Director and no Companies', async () => {
          // Empty site name response
          mocks.directors = [mocks.directors[0]]
          mocks.companies = []
          await checkPageElements(getRequest)
        })

        lab.test('for a single Company and no Directors', async () => {
          // Empty site name response
          mocks.directors = [mocks.directors[0]]
          mocks.companies = []
          await checkPageElements(getRequest)
        })

        lab.test('for multiple Directors and no Companies', async () => {
          mocks.companies = []
          await checkPageElements(getRequest)
        })

        lab.test('multiple Directors with existing data', async () => {
          mocks.directors[0].dob.day = 10
          mocks.directors[1].dob.day = 20
          mocks.directors[2].dob.day = 30
          await checkPageElements(getRequest)
        })

        lab.test('for multiple Companies and no Directors', async () => {
          mocks.directors = []
          await checkPageElements(getRequest)
        })

        lab.test('for multiple Companies and Directors', async () => {
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
            Code.expect(res.headers.location).to.equal(nextPath)
          })
        })

        lab.experiment('Failure:', () => {
          lab.test(`POST ${routePath} with no DOBs entered displays the correct error message`, async () => {
            await checkValidationError(undefined, 'Enter a date of birth')
          })

          lab.test(`POST ${routePath} with a missing day of birth entered displays the correct error message`, async () => {
            postRequest.payload['director-dob-day-0'] = '10'
            // No day of birth for director-dob-day-1 (mocks.directors[1])
            postRequest.payload['director-dob-day-2'] = '30'
            await checkValidationError('director-dob-day-1', `Enter a date of birth for ${mocks.directors[1].firstName} ${mocks.directors[1].lastName}`)
          })

          lab.test(`POST ${routePath} with a invalid day of birth (31st Feb) displays the correct error message`, async () => {
            postRequest.payload['director-dob-day-0'] = '10'
            postRequest.payload['director-dob-day-2'] = '30'

            // Month is Feb therefore this should trigger a validation error
            postRequest.payload['director-dob-day-1'] = '31'
            await checkValidationError('director-dob-day-1', `Enter a day between 1 and 28 for ${mocks.directors[1].firstName} ${mocks.directors[1].lastName}`)
          })

          lab.test(`POST ${routePath} with a invalid integer for the day of birth ('XXX') displays the correct error message`, async () => {
            postRequest.payload['director-dob-day-0'] = '10'
            postRequest.payload['director-dob-day-2'] = '30'

            // Day is not a valid integer therefore this should trigger a validation error
            postRequest.payload['director-dob-day-1'] = 'XXX'
            await checkValidationError('director-dob-day-1', `Enter a day between 1 and 28 for ${mocks.directors[1].firstName} ${mocks.directors[1].lastName}`)
          })

          lab.test(`POST ${routePath} with a invalid integer for the day of birth ('24.0') displays the correct error message`, async () => {
            postRequest.payload['director-dob-day-0'] = '10'
            postRequest.payload['director-dob-day-2'] = '30'

            // Day is not a valid integer therefore this should trigger a validation error
            postRequest.payload['director-dob-day-1'] = '24.0'
            await checkValidationError('director-dob-day-1', `Enter a day between 1 and 28 for ${mocks.directors[1].firstName} ${mocks.directors[1].lastName}`)
          })
        })
      })
    })
  })
})
