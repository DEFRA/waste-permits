const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const CryptoService = require('../../../src/services/crypto.service')
const RecoveryService = require('../../../src/services/recovery.service')
const Application = require('../../../src/persistence/entities/application.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.task')
const { capitalizeFirstLetter } = require('../../../src/utilities/utilities')
const { COOKIE_RESULT } = require('../../../src/constants')

let memberId = 'MEMBER_ID'

const routes = {
  'partner': {
    routePath: `/permit-holder/partners/name/${memberId}`,
    nextPath: `/permit-holder/partners/details/${memberId}`,
    errorPath: '/errors/technical-problem',
    PermitHolderTask: require('../../../src/models/taskList/partnerDetails.task')
  },
  'postholder': {
    includesJobTitle: true,
    routePath: `/permit-holder/group/post-holder/name/${memberId}`,
    nextPath: `/permit-holder/group/post-holder/contact-details/${memberId}`,
    errorPath: '/errors/technical-problem',
    PermitHolderTask: require('../../../src/models/taskList/postholderDetails.task')
  }
}

Object.entries(routes).forEach(([member, { includesJobTitle, routePath, nextPath, errorPath, PermitHolderTask }]) => {
  lab.experiment(capitalizeFirstLetter(member), () => {
    let mocks
    let sandbox

    let getRequest
    let postRequest

    lab.beforeEach(() => {
      mocks = new Mocks()

      mocks.contactDetailList = [mocks.contactDetail]

      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }

      const [dobYear, dobMonth, dobDay] = mocks.contactDetail.dateOfBirth.split('-')

      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'first-name': mocks.contactDetail.firstName,
          'last-name': mocks.contactDetail.lastName,
          'job-title': includesJobTitle ? mocks.contactDetail.jobTitle : '',
          'dob-day': dobDay,
          'dob-month': dobMonth,
          'dob-year': dobYear
        }
      }

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()

      // Stub methods
      sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
      sandbox.stub(CryptoService, 'decrypt').value(() => mocks.contactDetail.id)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(ContactDetail, 'get').value(() => mocks.contactDetail)
      sandbox.stub(ContactDetail, 'list').value(() => mocks.contactDetailList)
      sandbox.stub(ContactDetail.prototype, 'save').value(() => mocks.contactDetail.id)
      sandbox.stub(PermitHolderTask, 'getContactDetail').value(() => mocks.contactDetail)
      sandbox.stub(PermitHolderTask, 'getPageHeading').value((request, heading) => heading.replace('{{name}}', `${mocks.contactDetail.firstName} ${mocks.contactDetail.lastName}`))
      sandbox.stub(PermitHolderDetails, 'clearCompleteness').value(() => {})
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    const checkPageElements = async (request, data = {}) => {
      const { firstName = '', lastName = '', jobTitle = '', dateOfBirth = '---', heading } = data
      const [dobYear, dobMonth, dobDay] = dateOfBirth.split('-')
      const doc = await GeneralTestHelper.getDoc(request)

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(heading)

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'back-link',
        'defra-csrf-token'
      ])

      Code.expect(doc.getElementById('first-name').getAttribute('value')).to.equal(firstName)
      Code.expect(doc.getElementById('last-name').getAttribute('value')).to.equal(lastName)
      if (includesJobTitle) {
        Code.expect(doc.getElementById('job-title').getAttribute('value')).to.equal(jobTitle)
      }
      Code.expect(doc.getElementById('dob-day').getAttribute('value')).to.equal(dobDay)
      Code.expect(doc.getElementById('dob-month').getAttribute('value')).to.equal(dobMonth)
      Code.expect(doc.getElementById('dob-year').getAttribute('value')).to.equal(dobYear)
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

    lab.experiment('Name and Date of birth page tests:', () => {
      new GeneralTestHelper({ lab, routePath }).test()

      lab.experiment(`Get ${routePath}`, () => {
        lab.experiment('Success:', () => {
          lab.test(`when returns the page correctly when the first partner is being added`, async () => {
            delete mocks.contactDetail.firstName
            delete mocks.contactDetail.lastName
            delete mocks.contactDetail.jobTitle
            delete mocks.contactDetail.dateOfBirth
            const data = {
              heading: `Add the first ${member.toLowerCase()}`
            }
            return checkPageElements(getRequest, data)
          })

          lab.test(`when returns the page correctly when another partner is being added`, async () => {
            delete mocks.contactDetail.firstName
            delete mocks.contactDetail.lastName
            delete mocks.contactDetail.jobTitle
            delete mocks.contactDetail.dateOfBirth
            mocks.contactDetailList = [new ContactDetail(mocks.contactDetail), new ContactDetail(mocks.contactDetail)]
            const data = {
              heading: `Add another ${member.toLowerCase()}`
            }
            return checkPageElements(getRequest, data)
          })

          lab.test(`when returns the page correctly when the partner exists with an existing email and telephone number`, async () => {
            const data = {
              firstName: mocks.contactDetail.firstName,
              lastName: mocks.contactDetail.lastName,
              jobTitle: mocks.contactDetail.jobTitle,
              dateOfBirth: mocks.contactDetail.dateOfBirth,
              heading: `Edit this ${member.toLowerCase()}`
            }
            return checkPageElements(getRequest, data)
          })
        })

        lab.experiment('Failure:', () => {
          lab.test(`when the contactDetail does not exist`, async () => {
            const stub = sinon.stub(PermitHolderTask, 'getContactDetail').value(() => undefined)
            const res = await server.inject(getRequest)
            stub.restore()
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(errorPath)
          })
        })
      })

      lab.experiment(`POST ${routePath}`, () => {
        lab.experiment('Success:', () => {
          lab.test(`when the telephone and email are entered correctly`, async () => {
            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(nextPath)
          })
        })

        lab.experiment('Failure:', () => {
          lab.test(`when the contactDetail does not exist`, async () => {
            const stub = sinon.stub(PermitHolderTask, 'getContactDetail').value(() => undefined)
            const res = await server.inject(postRequest)
            stub.restore()
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers['location']).to.equal(errorPath)
          })
        })

        lab.experiment('Invalid:', () => {
          const day = 13
          const month = 10
          const year = 2016

          lab.beforeEach(() => {
            sandbox.stub(Date, 'now').value(() => new Date(year, month - 1, day))
            postRequest.payload['dob-day'] = day
            postRequest.payload['dob-month'] = month
          })

          lab.test(`shows an error message when the first name is blank`, async () => {
            postRequest.payload['first-name'] = ''
            await checkValidationErrors('first-name', ['Enter a first name'])
          })

          lab.test(`shows an error message when the first name contains invalid characters`, async () => {
            postRequest.payload['first-name'] = '___INVALID_FIRST_NAME___'
            await checkValidationErrors('first-name', ['First name can only include letters, hyphens and apostrophes - delete any other characters'])
          })

          lab.test(`shows multiple error messages on the first name field`, async () => {
            postRequest.payload['first-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
            const expectedErrors = [
              'Enter a shorter first name with no more than 50 characters',
              'First name can only include letters, hyphens and apostrophes - delete any other characters'
            ]
            await checkValidationErrors('first-name', expectedErrors)
          })

          lab.test(`shows an error message when the last name is blank`, async () => {
            postRequest.payload['last-name'] = ''
            await checkValidationErrors('last-name', ['Enter a last name'])
          })

          lab.test(`shows an error message when the last name contains invalid characters`, async () => {
            postRequest.payload['last-name'] = '___INVALID_LAST_NAME___'
            await checkValidationErrors('last-name', ['Last name can only include letters, hyphens and apostrophes - delete any other characters'])
          })

          lab.test(`shows multiple error messages on the last name field`, async () => {
            postRequest.payload['last-name'] = '_01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789X'
            const expectedErrors = [
              'Enter a shorter last name with no more than 50 characters',
              'Last name can only include letters, hyphens and apostrophes - delete any other characters'
            ]
            await checkValidationErrors('last-name', expectedErrors)
          })

          lab.test(`shows an error message when the day of birth is blank`, async () => {
            postRequest.payload['dob-day'] = ''
            await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
          })

          lab.test(`shows an error message when the month of birth is blank`, async () => {
            postRequest.payload['dob-month'] = ''
            await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
          })

          lab.test(`shows an error message when the year of birth is blank`, async () => {
            postRequest.payload['dob-year'] = ''
            await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
          })

          lab.test(`shows an error message when the date of birth is not a real date`, async () => {
            postRequest.payload['dob-month'] = '15'
            await checkValidationErrors('dob-day', ['Enter a valid date of birth'])
          })

          lab.test(`shows an error message when the age is less than 16`, async () => {
            postRequest.payload['dob-day'] = day + 1
            postRequest.payload['dob-year'] = year - 16
            await checkValidationErrors('dob-day', ['Enter a date of birth that is older than 16 and under 120 years of age'])
          })

          lab.test(`shows an error message when the age is greater than 120`, async () => {
            postRequest.payload['dob-year'] = year - 120
            await checkValidationErrors('dob-day', ['Enter a date of birth that is older than 16 and under 120 years of age'])
          })
        })
      })
    })
  })
})
