'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const RecoveryService = require('../../src/services/recovery.service')
const CookieService = require('../../src/services/cookie.service')

const Application = require('../../src/persistence/entities/application.entity')

const { PERMIT_HOLDER_TYPES } = require('../../src/dynamics')

const GeneralTestHelper = require('../routes/generalTestHelper.test')

let sandbox

const fakeAccount = {}
const fakeAuthToken = 'FAKE_AUTH_TOKEN'
const fakeApplication = { id: 'FAKE_APPLICATION_ID', permitHolderType: 'FAKE_PERMIT_HOLDER_TYPE' }
const fakeApplicationLine = { id: 'FAKE_AOPPLICATION_LINE_ID' }
const fakeApplicationReturn = {}
const fakeCardPayment = {}
const fakeContact = {}
const fakeStandardRule = { id: 'FAKE_STANDARD_RULE_ID', type: 'FAKE_STANDARD_RULE_TYPE_ID' }
const fakeSlug = {}
const fakeRequest = { app: { data: {} } }

const cookies = {
  authToken: () => fakeAuthToken,
  applicationId: () => fakeApplication.id,
  applicationLineId: () => fakeApplicationLine.id,
  standardRuleId: () => fakeStandardRule.id,
  standardRuleTypeId: () => fakeStandardRule.type
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  sandbox.stub(Application, 'getById').value(() => fakeApplication)

  GeneralTestHelper.stubGetCookies(sandbox, CookieService, cookies)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('RecoveryService tests:', () => {
  lab.test('recoverFromCookies() should return all application data', async () => {
    sandbox.stub(RecoveryService, 'getPermitHolderType').value((application) => application.type)
    sandbox.stub(RecoveryService, 'recoverOptionalData').value(() => {
      return {
        applicationLine: fakeApplicationLine,
        applicationReturn: fakeApplicationReturn,
        account: fakeAccount,
        contact: fakeContact,
        cardPayment: fakeCardPayment,
        standardRule: fakeStandardRule
      }
    })

    const recovery = await RecoveryService.recoverFromCookies(fakeSlug, fakeRequest)

    Code.expect(recovery.application).to.equal(fakeApplication)
    Code.expect(recovery.applicationId).to.equal(fakeApplication.id)
    Code.expect(recovery.applicationLineId).to.equal(fakeApplicationLine.id)
    Code.expect(recovery.applicationLineId).to.equal(fakeApplicationLine.id)
    Code.expect(recovery.applicationLine).to.equal(fakeApplicationLine)
    Code.expect(recovery.applicationReturn).to.equal(fakeApplicationReturn)
    Code.expect(recovery.account).to.equal(fakeAccount)
    Code.expect(recovery.contact).to.equal(fakeContact)
    Code.expect(recovery.cardPayment).to.equal(fakeCardPayment)
    Code.expect(recovery.standardRule).to.equal(fakeStandardRule)
    Code.expect(recovery.standardRuleTypeId).to.equal(fakeStandardRule.type)
    Code.expect(recovery.permitHolderType).to.equal(fakeStandardRule.permitHolderType)
    Code.expect(recovery.slug).to.equal(fakeSlug)
  })

  lab.experiment('getPermitHolderType() should return', () => {
    lab.test('undefined if there is no application', () => {
      Code.expect(RecoveryService.getPermitHolderType(undefined)).to.equal(undefined)
    })

    lab.test('undefined if there is no permit holder type matching application types', () => {
      let application = {
        applicantType: 1,
        organisationType: 2
      }
      Code.expect(RecoveryService.getPermitHolderType(application)).to.equal(undefined)
    })

    lab.test('undefined if there are mismatching a permit holder types', () => {
      let application = {
        applicantType: PERMIT_HOLDER_TYPES.LIMITED_LIABILITY_PARTNERSHIP.dynamicsApplicantTypeId,
        organisationType: PERMIT_HOLDER_TYPES.INDIVIDUAL.dynamicsOrganisationTypeId
      }
      Code.expect(RecoveryService.getPermitHolderType(application)).to.equal(undefined)
    })

    lab.test('a permit holder type if there is a permit holder type matching application types', () => {
      let application = {
        applicantType: PERMIT_HOLDER_TYPES.PUBLIC_BODY.dynamicsApplicantTypeId,
        organisationType: PERMIT_HOLDER_TYPES.PUBLIC_BODY.dynamicsOrganisationTypeId
      }
      Code.expect(RecoveryService.getPermitHolderType(application)).to.equal(PERMIT_HOLDER_TYPES.PUBLIC_BODY)
    })
  })
})
