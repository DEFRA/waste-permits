'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../src/models/application.model')
const ApplicationReturn = require('../../src/models/applicationReturn.model')
const LoggingService = require('../../src/services/logging.service')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

const fakeOrigin = 'http://test.app.com'
const fakeSlug = 'SLUG'
let testApplication
let sandbox

const testApplicationId = 'APPLICATION_ID'
const authToken = 'THE_AUTH_TOKEN'
const submittedOn = '05/01/2018 04:00:00'

const fakeApplicationData = {
  accountId: 'ACCOUNT_ID',
  agentId: 'AGENT_ID',
  applicantType: 'APPLICANT_TYPE',
  applicationName: 'APPLICATION_NAME',
  applicationNumber: 'APPLICATION_NUMBER',
  bankruptcy: 'BANKRUPTCY',
  bankruptcyDetails: 'BANKRUPTCY_DETAILS',
  confidentiality: 'CONFIDENTIALITY',
  confidentialityDetails: 'CONFIDENTIALITY_DETAILS',
  contactId: 'CONTACT_ID',
  declaration: true,
  drainageType: 'DRAINAGE_TYPE',
  id: testApplicationId,
  paymentReceived: 'PAYMENT_RECEIVED',
  regime: 910400000,
  relevantOffences: 'RELEVANT_OFFENCES',
  relevantOffencesDetails: 'RELEVANT_OFFENCES_DETAILS',
  source: 910400000,
  statusCode: 'STATUS_CODE',
  submittedOn: new Date(submittedOn),
  technicalQualification: 'TECHNICAL_QUALIFICATIONS',
  tradingName: 'TRADING_NAME',
  saveAndReturnEmail: 'fake@email.com'
}
const fakeApplicationReturnData = {
  applicationId: testApplicationId,
  slug: fakeSlug
}

const fakeApplicationDynamicsRecord = (options = {}) => {
  const application = Object.assign({}, fakeApplicationData, options)
  return {
    _defra_customerid_value: application.accountId,
    _defra_agentid_value: application.agentId,
    defra_name: application.applicationName,
    defra_applicant_type: application.applicantType,
    defra_applicationnumber: application.applicationNumber,
    defra_bankruptcydeclaration: application.bankruptcy,
    defra_bankruptcydeclarationdetails: application.bankruptcyDetails,
    defra_confidentialitydeclaration: application.confidentiality,
    defra_confidentialitydeclarationdetails: application.confidentialityDetails,
    defra_drainagetype: application.drainageType,
    _defra_primarycontactid_value: application.contactId,
    defra_applicationdeclaration: application.declaration,
    defra_applicationid: application.id,
    defra_paymentreceived: application.paymentReceived,
    defra_regime: application.regime,
    defra_convictionsdeclaration: application.relevantOffences,
    defra_convictionsdeclarationdetails: application.relevantOffencesDetails,
    defra_source: application.source,
    statuscode: application.statusCode,
    defra_submittedon: application.submittedOn.toISOString(),
    defra_technicalability: application.technicalQualification,
    defra_tradingname: application.tradingName,
    defra_saveandreturnemail: application.saveAndReturnEmail
  }
}

const applicationNumbers = ['APPLICATION_NUMBER_1', 'APPLICATION_NUMBER_2', 'APPLICATION_NUMBER_3']
const dynamicsApplicationList = [
  fakeApplicationDynamicsRecord({applicationNumber: applicationNumbers[0]}),
  fakeApplicationDynamicsRecord({applicationNumber: applicationNumbers[1]}),
  fakeApplicationDynamicsRecord({applicationNumber: applicationNumbers[2]})]

lab.beforeEach(() => {
  testApplication = new Application(fakeApplicationData)
  testApplication.delay = 0

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => testApplicationId)
  sandbox.stub(DynamicsDalService.prototype, 'update').value(() => testApplicationId)
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => {
    // Dynamics Application object
    return {
      '@odata.etag': 'W/"1039198"',
      _defra_customerid_value: fakeApplicationData.accountId
    }
  })
  sandbox.stub(DynamicsDalService.prototype, 'callAction').value(() => {})
  sandbox.stub(ApplicationReturn, 'getByApplicationId').value(() => new ApplicationReturn(fakeApplicationReturnData))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Application Model tests:', () => {
  lab.test('getById() method correctly retrieves an Application object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const application = await Application.getById('AUTH_TOKEN', testApplicationId)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(application.accountId).to.equal(fakeApplicationData.accountId)
    Code.expect(application.id).to.equal(testApplicationId)
  })

  lab.test('listBySaveAndReturnEmail() method correctly retrieves a list of unsubmitted applications Application objects filtered by ', async () => {
    DynamicsDalService.prototype.search = () => {
      return {
        value: dynamicsApplicationList
      }
    }
    const applicationList = await Application.listBySaveAndReturnEmail('AUTH_TOKEN', fakeApplicationData.saveAndReturnEmail)
    Code.expect(Array.isArray(applicationList)).to.be.true()
    Code.expect(applicationList.length).to.equal(3)
    applicationList.forEach((application, index) => {
      const testApplication = Object.assign({}, fakeApplicationData, {applicationNumber: applicationNumbers[index]})
      Code.expect(application).to.equal(testApplication)
    })
  })

  lab.test('sendSaveAndReturnEmail() method correctly initiates an email call action', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'callAction')
    const logSpy = sandbox.spy(LoggingService, 'logDebug')
    await testApplication.sendSaveAndReturnEmail('AUTH_TOKEN', fakeOrigin)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(logSpy.callCount).to.equal(1)
    Code.expect(logSpy.calledWith(`Save and Return Url for Application "${fakeApplicationData.applicationNumber}": ${fakeOrigin}/r/${fakeSlug}`)).to.equal(true)
  })

  lab.test('sendAllRecoveryEmails() method correctly initiates an email call action for each application', async () => {
    DynamicsDalService.prototype.search = () => {
      return {
        value: dynamicsApplicationList
      }
    }
    const spy = sinon.spy(DynamicsDalService.prototype, 'callAction')
    await Application.sendAllRecoveryEmails('AUTH_TOKEN', fakeOrigin, fakeApplicationData.saveAndReturnEmail)
    Code.expect(spy.callCount).to.equal(dynamicsApplicationList.length)
  })

  lab.test('save() method saves a new Application object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    delete testApplication.id
    await testApplication.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testApplication.id).to.equal(testApplicationId)
  })

  lab.test('save() method updates an existing Application object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await testApplication.save(authToken)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testApplication.id).to.equal(testApplicationId)
  })
})
