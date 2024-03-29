'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const CharityDetail = require('../../../src/models/charityDetail.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const PermitHolderTypeController = require('../../../src/controllers/permitHolder/permitHolderType.controller')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.task')
const { COOKIE_RESULT } = require('../../../src/constants')
const { MCP_TYPES } = require('../../../src/dynamics')

const routePath = '/permit-holder/type'
const nextRoutePath = '/permit-holder/details'
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(CharityDetail.prototype, 'delete').value(() => undefined)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(PermitHolderDetails, 'clearCompleteness').value(() => true)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Permit holder type: Who will be the permit holder? page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test()

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Who will be the permit holder?')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

    GeneralTestHelper.checkElementsExist(doc, [
      'permit-holder-message',
      'permit-holder-requirements-link',
      'helpline-text'
    ])
  }

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
      const holderTypes = [
        { id: 'limited-company', type: 'Limited company' },
        { id: 'individual', type: 'Individual' },
        { id: 'sole-trader', type: 'Sole trader' },
        { id: 'public-body', type: 'Local authority or public body' },
        { id: 'partnership', type: 'Partnership' },
        { id: 'charity-or-trust', type: 'Charity or trust' },
        { id: 'limited-liability-partnership', type: 'Limited liability partnership' },
        { id: 'other-organisation', type: 'Other organisation or group, for example a club,  association or group of individuals' }
      ]

      holderTypes.forEach(({ id, type }) => {
        lab.test(`should include option for ${type}`, async () => {
          const doc = await GeneralTestHelper.getDoc(getRequest)
          checkCommonElements(doc)
          const prefix = `chosen-holder-${id}`
          Code.expect(doc.getElementById(`${prefix}-input`).getAttribute('value')).to.equal(id)
          Code.expect(doc.getElementById(`${prefix}-label`)).to.exist()
          Code.expect(doc.getElementById(`${prefix}-type`).firstChild.nodeValue.trim()).to.equal(type)
        })
      })

      const mcpTypes = Object.keys(MCP_TYPES).map((mcpType) => MCP_TYPES[mcpType])

      mcpTypes.forEach((mcpType) => {
        const { id, isMobile } = mcpType
        lab.test(`should ${isMobile ? 'include' : 'omit'} the mobile generator text when the mcpType is ${id}`, async () => {
          mocks.context.mcpType = mcpType
          const doc = await GeneralTestHelper.getDoc(getRequest)
          if (isMobile) {
            Code.expect(doc.getElementById('mobile-generator-message')).to.exist()
          } else {
            Code.expect(doc.getElementById('mobile-generator-message')).to.not.exist()
          }
        })
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to recover the application', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('application recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(500)
      })
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest
    let prevPermitHolderType

    lab.beforeEach(() => {
      prevPermitHolderType = Object.assign({}, mocks.permitHolderType, { id: 'prev-permit-holder-type' })
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      const checkRoute = async (route) => {
        postRequest.payload['chosen-holder-type'] = mocks.permitHolderType.id
        const res = await server.inject(postRequest)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers.location).to.equal(route)
      }

      lab.beforeEach(() => {
        mocks.recovery.permitHolderType = prevPermitHolderType
        sandbox.stub(PermitHolderTypeController, 'getHolderTypes').value(() => [mocks.permitHolderType, prevPermitHolderType])
      })

      lab.test('when holder type can apply online and is an individual', async () => {
        mocks.permitHolderType.dynamicsApplicantTypeId = 910400001
        await checkRoute(nextRoutePath)
      })

      lab.test('when holder type can apply online and is an organisation', async () => {
        await checkRoute(nextRoutePath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when type not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        await GeneralTestHelper.checkValidationMessage(doc, 'chosen-holder-type', 'Select who will be the permit holder')
      })
    })
  })
})
