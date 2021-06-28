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
const { capitalizeFirstLetter } = require('../../../src/utilities/utilities')
const ContactDetail = require('../../../src/models/contactDetail.model')
const { COOKIE_RESULT } = require('../../../src/constants')

const memberId = 'MEMBER_ID'

const routes = {
  partner: {
    routePath: `/permit-holder/partners/details/${memberId}`,
    nextPath: `/permit-holder/partners/address/postcode/${memberId}`,
    PermitHolderTask: require('../../../src/models/taskList/partnerDetails.task')
  },
  postholder: {
    routePath: `/permit-holder/group/post-holder/contact-details/${memberId}`,
    nextPath: `/permit-holder/group/post-holder/address/postcode/${memberId}`,
    PermitHolderTask: require('../../../src/models/taskList/postholderDetails.task')
  }
}

Object.entries(routes).forEach(([member, { routePath, nextPath, PermitHolderTask }]) => {
  lab.experiment(capitalizeFirstLetter(member), () => {
    let mocks
    let sandbox

    let getRequest
    let postRequest

    lab.beforeEach(() => {
      mocks = new Mocks()

      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }

      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          email: 'test@test.com',
          telephone: '01234567890'
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
      sandbox.stub(ContactDetail.prototype, 'save').value(() => mocks.contactDetail.id)
      sandbox.stub(PermitHolderTask, 'getContactDetail').value(() => mocks.contactDetail)
      sandbox.stub(PermitHolderTask, 'getPageHeading').value((request, heading) => heading.replace('{{name}}', `${mocks.contactDetail.firstName} ${mocks.contactDetail.lastName}`))
    })

    lab.afterEach(() => {
      // Restore the sandbox to make sure the stubs are removed correctly
      sandbox.restore()
    })

    const checkPageElements = async (request, expectedEmail, expectedTelephone, name) => {
      const doc = await GeneralTestHelper.getDoc(request)

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(`What are the contact details for ${name}?`)

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'back-link',
        'defra-csrf-token'
      ])

      Code.expect(doc.getElementById('telephone').getAttribute('value')).to.equal(expectedTelephone)
      Code.expect(doc.getElementById('email').getAttribute('value')).to.equal(expectedEmail)
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

    lab.experiment('Contact Details page tests:', () => {
      new GeneralTestHelper({ lab, routePath }).test()

      lab.experiment(`Get ${routePath}`, () => {
        lab.experiment('Success:', () => {
          lab.test('when returns the page correctly when the partner exists with no email and telephone number', async () => {
            delete mocks.contactDetail.email
            delete mocks.contactDetail.telephone
            const { firstName, lastName } = mocks.contactDetail
            return checkPageElements(getRequest, '', '', `${firstName} ${lastName}`)
          })

          lab.test('when returns the page correctly when the partner exists with an existing email and telephone number', async () => {
            const { firstName, lastName, email, telephone } = mocks.contactDetail
            return checkPageElements(getRequest, email, telephone, `${firstName} ${lastName}`)
          })
        })

        lab.experiment('Failure:', () => {
          lab.test('when the contactDetail does not exist', async () => {
            const stub = sinon.stub(PermitHolderTask, 'getContactDetail').value(() => undefined)
            const res = await server.inject(getRequest)
            stub.restore()
            Code.expect(res.statusCode).to.equal(500)
          })
        })
      })

      lab.experiment(`POST ${routePath}`, () => {
        lab.experiment('Success:', () => {
          lab.test('when the telephone and email are entered correctly', async () => {
            const res = await server.inject(postRequest)
            Code.expect(res.statusCode).to.equal(302)
            Code.expect(res.headers.location).to.equal(nextPath)
          })
        })

        lab.experiment('Failure:', () => {
          lab.test('when the contactDetail does not exist', async () => {
            const stub = sinon.stub(PermitHolderTask, 'getContactDetail').value(() => undefined)
            const res = await server.inject(postRequest)
            stub.restore()
            Code.expect(res.statusCode).to.equal(500)
          })
        })

        lab.experiment('Invalid:', () => {
          lab.test('shows an error message when the email is blank', async () => {
            postRequest.payload.email = ''
            await checkValidationErrors('email', ['Enter an email address'])
          })

          lab.test('shows an error message when the email has an invalid format', async () => {
            postRequest.payload.email = 'INVALID_EMAIL'
            await checkValidationErrors('email', ['Enter a valid email address'])
          })

          lab.test('shows an error message when the telephone is blank', async () => {
            postRequest.payload.telephone = ''
            await checkValidationErrors('telephone', ['Enter a telephone number'])
          })

          lab.test('shows an error message when the telephone contains invalid characters', async () => {
            postRequest.payload.telephone = '0123456789A'
            await checkValidationErrors('telephone', ['Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.'])
          })

          lab.test('shows multiple error messages on the telephone field', async () => {
            postRequest.payload.telephone = '+0123456789A'
            const expectedErrors = [
              'Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.',
              'The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0'
            ]
            await checkValidationErrors('telephone', expectedErrors)
          })
        })
      })
    })
  })
})
