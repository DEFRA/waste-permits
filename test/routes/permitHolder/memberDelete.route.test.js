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
    routePath: `/permit-holder/partners/delete/${memberId}`,
    nextPath: '/permit-holder/partners/list',
    PermitHolderTask: require('../../../src/models/taskList/partnerDetails.task')
  },
  'postholder': {
    routePath: `/permit-holder/group/post-holder/delete/${memberId}`,
    nextPath: '/permit-holder/group/list',
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
        payload: {}
      }

      // Create a sinon sandbox to stub methods
      sandbox = sinon.createSandbox()

      // Stub methods
      sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
      sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
      sandbox.stub(CryptoService, 'decrypt').value(() => mocks.contactDetail.id)
      sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
      sandbox.stub(ContactDetail, 'get').value(() => mocks.contactDetail)
      sandbox.stub(ContactDetail.prototype, 'delete').value(() => false)
      sandbox.stub(PermitHolderTask, 'getContactDetail').value(() => mocks.contactDetail)
      sandbox.stub(PermitHolderTask, 'getPageHeading').value((request, heading) => heading.replace('{{name}}', `${mocks.contactDetail.firstName} ${mocks.contactDetail.lastName}`))
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

      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal(`Delete this ${member}`)
      Code.expect(doc.getElementById('skip-delete-member-link').firstChild.nodeValue).to.equal('Do not delete')
      Code.expect(doc.getElementById('skip-delete-member-link').getAttribute('href')).to.equal(nextPath)
    }

    lab.experiment(`Delete page tests:`, () => {
      new GeneralTestHelper({ lab, routePath }).test()

      lab.experiment(`Get ${routePath}`, () => {
        lab.experiment('Success:', () => {
          lab.test('when the page is displayed', async () => {
            const { firstName, lastName } = mocks.contactDetail
            return checkPageElements(getRequest, `${firstName} ${lastName}`)
          })
        })

        lab.experiment('Failure:', () => {
          lab.test(`when the contactDetail does not exist`, async () => {
            const stub = sinon.stub(PermitHolderTask, 'getContactDetail').value(() => undefined)
            const res = await server.inject(getRequest)
            stub.restore()
            Code.expect(res.statusCode).to.equal(500)
          })
        })
      })

      lab.experiment(`POST ${routePath}`, () => {
        lab.experiment('Success:', () => {
          lab.test(`when the ${member} is deleted`, async () => {
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
            Code.expect(res.statusCode).to.equal(500)
          })
        })
      })
    })
  })
})
