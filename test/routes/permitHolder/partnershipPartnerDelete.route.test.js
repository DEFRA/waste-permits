const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const CryptoService = require('../../../src/services/crypto.service')
const RecoveryService = require('../../../src/services/recovery.service')
const Application = require('../../../src/persistence/entities/application.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const PartnerDetails = require('../../../src/models/taskList/partnerDetails.task')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.task')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox
let fakePartnershipId = 'PARTNERSHIP_ID'

const routePath = `/permit-holder/partners/delete/${fakePartnershipId}`
const errorPath = '/errors/technical-problem'
const nextRoutePath = `/permit-holder/partners/list`

let getRequest
let postRequest
let fakeApplication
let fakeContactDetail
let fakeRecovery

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER'
  }

  fakeContactDetail = {
    id: 'CONTACT_DETAIL_ID',
    applicationId: fakeApplication.id,
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME'
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: 'APPLICATION_LINE_ID',
    application: new Application(fakeApplication)
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
  sandbox.stub(CryptoService, 'decrypt').value(() => fakeContactDetail.id)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(fakeContactDetail))
  sandbox.stub(ContactDetail.prototype, 'delete').value(() => false)
  sandbox.stub(PartnerDetails, 'getContactDetail').value(() => new ContactDetail(fakeContactDetail))
  sandbox.stub(PartnerDetails, 'getPageHeading').value((request, heading) => heading.replace('{{name}}', `${fakeContactDetail.firstName} ${fakeContactDetail.lastName}`))
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
  new GeneralTestHelper({ lab, routePath }).test()

  lab.experiment(`Get ${routePath}`, () => {
    lab.experiment('Success:', () => {
      lab.test('when the page is displayed', async () => {
        const { firstName, lastName } = fakeContactDetail
        return checkPageElements(getRequest, `${firstName} ${lastName}`)
      })
    })

    lab.experiment('Failure:', () => {
      lab.test(`when the contactDetail does not exist`, async () => {
        const stub = sinon.stub(PartnerDetails, 'getContactDetail').value(() => undefined)
        const res = await server.inject(getRequest)
        stub.restore()
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
      lab.test(`when the contactDetail does not exist`, async () => {
        const stub = sinon.stub(PartnerDetails, 'getContactDetail').value(() => undefined)
        const res = await server.inject(postRequest)
        stub.restore()
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
