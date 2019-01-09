'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/persistence/entities/application.entity')
const CharityDetail = require('../../../src/models/charityDetail.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const PermitHolderTypeController = require('../../../src/controllers/permitHolder/permitHolderType.controller')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/permit-holder'
const nextRoutePath = '/permit/category'
const offlineRoutePath = '/start/apply-offline'
const errorPath = '/errors/technical-problem'

let fakeApplication
let fakePermitHolderType
let sandbox

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationNumber: 'APPLICATION_NUMBER'
  }

  fakePermitHolderType = {
    id: 'PERMIT_HOLDER_TYPE_ID',
    type: 'PERMIT_HOLDER_TYPE',
    canApplyOnline: true,
    dynamicsApplicantTypeId: 'APPLICANT_TYPE'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => {})
  sandbox.stub(CharityDetail, 'get').value(() => new CharityDetail({}))
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
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
      let holderTypes = [
        { id: 'limited-company', type: 'Limited company', canApplyOnline: true },
        { id: 'individual', type: 'Individual', canApplyOnline: true },
        { id: 'sole-trader', type: 'Sole trader', canApplyOnline: false },
        { id: 'public-body', type: 'Local authority or public body', canApplyOnline: false },
        { id: 'partnership', type: 'Partnership', canApplyOnline: false },
        { id: 'charity-or-trust', type: 'Charity or trust', canApplyOnline: false },
        { id: 'limited-liability-partnership', type: 'Limited liability partnership', canApplyOnline: false },
        { id: 'other-organisation', type: 'Other organisation, for example a club or association', canApplyOnline: false }
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
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
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
        payload: {}
      }
    })

    lab.experiment('success', () => {
      const checkRoute = async (route) => {
        postRequest.payload['chosen-holder-type'] = fakePermitHolderType.id
        const res = await server.inject(postRequest)

        // Make sure a redirection has taken place correctly
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(route)
      }

      lab.beforeEach(() => {
        sandbox.stub(PermitHolderTypeController, 'getHolderTypes').value(() => [fakePermitHolderType])
      })

      lab.test('when holder type can apply online and is an individual', async () => {
        await checkRoute(nextRoutePath)
      })

      lab.test('when holder type can apply online and is an organisation', async () => {
        fakePermitHolderType.dynamicsOrganisationTypeId = 'ORGANISATION_TYPE'
        await checkRoute(nextRoutePath)
      })

      lab.test('when holder type cannot apply online', async () => {
        fakePermitHolderType.canApplyOnline = false
        await checkRoute(offlineRoutePath)
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
