'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')

const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const ApplicationReturn = require('../../../src/persistence/entities/applicationReturn.entity')
const Contact = require('../../../src/persistence/entities/contact.entity')
const Payment = require('../../../src/persistence/entities/payment.entity')
const StandardRule = require('../../../src/persistence/entities/standardRule.entity')
const DataStore = require('../../../src/models/dataStore.model')
const CharityDetail = require('../../../src/models/charityDetail.model')
const TaskDeterminants = require('../../../src/models/taskDeterminants.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const slug = 'SLUG'

const routePath = `/r/${slug}`
const nextRoutePath = '/task-list'
const nextRouteNoLinesPath = '/bespoke-or-standard-rules'
const nextPathForBacs = '/pay/bacs-proof'
const recoveryFailedPath = '/errors/recovery-failed'

let sandbox
let mocks
let bacsPaymentStub

const allActivities = [
  { id: 'act-1', shortName: '1-10-2' },
  { id: 'act-2', shortName: '1-10-3' },
  { id: 'act-3', shortName: '2-4-5' },
  { id: 'act-4', shortName: '44-5-6' },
  { id: 'act-5', shortName: 'ABC-D' }
]

lab.beforeEach(() => {
  mocks = new Mocks()

  mocks.applicationLines = []

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(CookieService, 'generateCookie').value(() => ({ authToken: 'AUTH_TOKEN' }))
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(ApplicationLine, 'getByApplicationId').value(() => mocks.applicationLine)
  sandbox.stub(ApplicationLine, 'listBy').value(async () => mocks.applicationLines)
  sandbox.stub(ApplicationReturn, 'getBySlug').value(() => mocks.applicationReturn)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Contact, 'getByApplicationId').value(() => mocks.contact)
  sandbox.stub(Payment, 'getBacsPaymentDetails').value(() => {})
  bacsPaymentStub = sandbox.stub(Payment, 'getBacsPayment')
  bacsPaymentStub.resolves(undefined)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(CharityDetail, 'get').value(() => mocks.charityDetail)
  sandbox.stub(TaskDeterminants, 'get').value(() => mocks.taskDeterminants)
  sandbox.stub(DataStore, 'get').value(() => mocks.dataStore)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('We found your application:', () => {
  new GeneralTestHelper({ lab, routePath, routeParams: [slug] }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true
  })

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('when found and standard rules', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)
        GeneralTestHelper.checkElementsExist(doc, [
          'submit-button',
          'reference-number',
          'permit-name-and-code',
          'pre-application-notice'
        ])
        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('We found your application')
        Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Go to your application')
        Code.expect(doc.getElementById('application-number').firstChild.nodeValue).to.equal(mocks.application.applicationNumber)
        Code.expect(doc.getElementById('permit-name').firstChild.nodeValue).to.equal(mocks.standardRule.permitName)
        Code.expect(doc.getElementById('code').firstChild.nodeValue).to.equal(mocks.standardRule.code)
      })

      // TODO: complete test for when found and MCP bespoke

      lab.test('when not found', async () => {
        ApplicationReturn.getBySlug = () => undefined
        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(recoveryFailedPath)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'save-and-return-email': mocks.application.saveAndReturnEmail
        }
      }
    })

    lab.test('success when there are application lines', async () => {
      mocks.taskDeterminants.wasteActivities = [...allActivities]
      allActivities.forEach(({ id }) => mocks.applicationLines.push(new ApplicationLine(Object.assign({}, mocks.applicationLine, { itemId: id }))))

      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRoutePath)
    })

    lab.test('success when there are no application lines', async () => {
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRouteNoLinesPath)
    })

    lab.test('success when outstanding BACS payment', async () => {
      bacsPaymentStub.resolves(mocks.payment)
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextPathForBacs)
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })
})
