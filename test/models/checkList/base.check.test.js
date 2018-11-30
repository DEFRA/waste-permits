'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Account = require('../../../src/persistence/entities/account.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const Annotation = require('../../../src/persistence/entities/annotation.entity')
const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationAnswer = require('../../../src/persistence/entities/applicationAnswer.entity')
const Location = require('../../../src/persistence/entities/location.entity')
const LocationDetail = require('../../../src/persistence/entities/locationDetail.entity')
const StandardRule = require('../../../src/persistence/entities/standardRule.entity')

const ContactDetail = require('../../../src/models/contactDetail.model')

const BaseCheck = require('../../../src/models/checkList/base.check')
const day = 1
const month = 2
const year = 1998

let fakeAddressType
let fakeAccount
let fakeApplication
let fakeApplicationAnswer
let fakeCompanies
let fakeContactDetail
let fakeLocation
let fakeLocationDetail
let fakeAddress
let fakePermitHolderType
let fakeStandardRule
let fakeAnnotation

let sandbox
let context

lab.beforeEach(() => {
  fakeAddressType = {
    TYPE: 'ADDRESS_TYPE'
  }
  fakeAccount = {
    id: 'ACCOUNT_ID',
    companyNumber: 'COMPANY_NUMBER'
  }
  fakeApplication = {
    id: 'APPLICATION_ID',
    agentId: 'AGENT_ID',
    contactId: 'CONTACT_ID',
    declaration: true
  }
  fakeApplicationAnswer = {
    questionCode: 'QUESTION_CODE'
  }
  fakeCompanies = [new Account(fakeAccount)]
  fakeAddress = {
    id: 'ADDRESS_ID'
  }
  fakeContactDetail = {
    id: 'CONTACT_DETAILS_ID',
    firstName: 'FIRSTNAME',
    lastName: 'LASTNAME',
    dateOfBirth: `${year}-${month}-${day}`,
    email: 'EMAIL',
    telephone: 'TELEPHONE',
    fullAddress: 'FULL ADDRESS',
    type: fakeAddressType.TYPE,
    addressId: fakeAddress.id
  }
  fakeLocation = {
    id: 'LOCATION_ID',
    applicationLineId: 'APPLICATION_LINE_ID'
  }
  fakeLocationDetail = {
    id: 'LOCATION_DETAIL_ID'
  }
  fakePermitHolderType = {
    id: 'PERMIT_HOLDER_TYPE'
  }
  fakeStandardRule = {
    id: 'STANDARD_RULE_ID',
    code: 'CODE',
    codeForId: 'code'
  }
  fakeAnnotation = {
    id: 'ANNOTATION_ID'
  }

  context = {}

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Account, 'getById').value(() => new Account(fakeAccount))
  sandbox.stub(Account, 'getByApplicationId').value(() => new Account(fakeAccount))
  sandbox.stub(Account.prototype, 'listLinked').value(() => [new Account(fakeAccount)])
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress))
  sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [new Annotation(fakeAnnotation)])
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(ApplicationAnswer, 'getByQuestionCode').value(() => new ApplicationAnswer(fakeApplicationAnswer))
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => new StandardRule(fakeStandardRule))
  sandbox.stub(Location, 'getByApplicationId').value(() => new Location(fakeLocation))
  sandbox.stub(LocationDetail, 'getByLocationId').value(() => new LocationDetail(fakeLocationDetail))
  sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(fakeContactDetail))
  sandbox.stub(ContactDetail, 'list').value(() => [new ContactDetail(fakeContactDetail)])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Base Check tests:', () => {
  lab.test('buildline works correctly', () => {
    const check = new BaseCheck(context)
    const prefix = 'check-test'
    const heading = 'SECTION_HEADING'
    const answers = ['ANSWER-1', 'ANSWER-2']
    const links = [{ path: '/path-1', type: 'type 1' }, { path: '/path-2', type: 'type 2' }]
    const line = check.buildLine({ heading, prefix, answers, links })

    Code.expect(line.heading).to.equal(heading)
    Code.expect(line.headingId).to.equal(`section-${prefix}-heading`)

    line.answers.forEach(({ answer, answerId }, index) => {
      Code.expect(answer).to.equal(answers[index])
      Code.expect(answerId).to.equal(`section-${prefix}-answer-${index + 1}`)
    })

    line.links.forEach(({ link, linkId, linkType }, index) => {
      Code.expect(link).to.equal(links[index].path)
      Code.expect(linkType).to.equal(links[index].type)
      Code.expect(linkId).to.equal(`section-${prefix}-link-${index + 1}`)
    })

    Code.expect(check.prefix).to.equal('section')
  })

  lab.test('getApplication works correctly', async () => {
    const check = new BaseCheck(context)
    const application = await check.getApplication()
    Code.expect(application).to.equal(fakeApplication)
    Code.expect(context.application).to.equal(await check.getApplication())
  })

  lab.test('getAgentAccount works correctly', async () => {
    const check = new BaseCheck(context)
    const agentAccount = await check.getAgentAccount()
    Code.expect(agentAccount).to.equal(fakeAccount)
    Code.expect(context.agentAccount).to.equal(await check.getAgentAccount())
  })

  lab.test('getContactDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const contactDetail = await check.getContactDetails(fakeAddressType)
    Code.expect(contactDetail).to.equal(fakeContactDetail)
    Code.expect(context.contactDetails[0]).to.equal(await check.getContactDetails(fakeAddressType))
  })

  lab.test('listContactDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const contactDetails = await check.listContactDetails(fakeAddressType)
    Code.expect(contactDetails).to.equal([fakeContactDetail])
    Code.expect(context.contactDetails).to.equal(await check.listContactDetails(fakeAddressType))
  })

  lab.test('getCompanyRegisteredAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const companyRegisteredAddress = await check.getCompanyRegisteredAddress()
    Code.expect(companyRegisteredAddress).to.equal(fakeContactDetail)
    Code.expect(context.companyRegisteredAddress).to.equal(await check.getCompanyRegisteredAddress())
  })

  lab.test('getCompanies works correctly', async () => {
    const check = new BaseCheck(context)
    const companies = await check.getCompanies()
    Code.expect(companies).to.equal(fakeCompanies)
    Code.expect(context.companies).to.equal(await check.getCompanies())
  })

  lab.test('getPermitHolderType works correctly', async () => {
    context.permitHolderType = fakePermitHolderType
    const check = new BaseCheck(context)
    const permitHolderType = await check.getPermitHolderType()
    Code.expect(permitHolderType).to.equal(fakePermitHolderType)
    Code.expect(context.permitHolderType).to.equal(await check.getPermitHolderType())
  })

  lab.test('getBillingInvoicingDetails works correctly', async () => {
    fakeAddressType = { TYPE: 910400004 }
    fakeContactDetail.type = fakeAddressType.TYPE
    const check = new BaseCheck(context)
    const billingInvoicingDetails = await check.getBillingInvoicingDetails()
    Code.expect(billingInvoicingDetails).to.equal(fakeContactDetail)
    Code.expect(context.contactDetails[0]).to.equal(await check.getBillingInvoicingDetails())
  })

  lab.test('getLocation works correctly', async () => {
    const check = new BaseCheck(context)
    const location = await check.getLocation()
    Code.expect(location).to.equal(fakeLocation)
    Code.expect(context.location).to.equal(await check.getLocation())
  })

  lab.test('getLocationDetail works correctly', async () => {
    const check = new BaseCheck(context)
    const locationDetail = await check.getLocationDetail()
    Code.expect(locationDetail).to.equal(fakeLocationDetail)
    Code.expect(context.locationDetail).to.equal(await check.getLocationDetail())
  })

  lab.test('getMainAddress works correctly', async () => {
    fakeAddressType = { TYPE: 910400001 }
    fakeContactDetail.type = fakeAddressType.TYPE
    const check = new BaseCheck(context)
    const mainAddress = await check.getMainAddress()
    Code.expect(mainAddress).to.equal(fakeContactDetail)
    Code.expect(context.mainAddress).to.equal(await check.getMainAddress())
  })

  lab.test('getLocationAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const locationAddress = await check.getLocationAddress()
    Code.expect(locationAddress).to.equal(fakeAddress)
    Code.expect(context.locationAddress).to.equal(await check.getLocationAddress())
  })

  lab.test('getInvoiceAddress works correctly', async () => {
    fakeAddressType = { TYPE: 910400004 }
    fakeContactDetail.type = fakeAddressType.TYPE
    const check = new BaseCheck(context)
    const invoiceAddress = await check.getInvoiceAddress()
    Code.expect(invoiceAddress).to.equal(fakeAddress)
    Code.expect(context.invoiceAddress).to.equal(await check.getInvoiceAddress())
  })

  lab.test('getStandardRule works correctly', async () => {
    const check = new BaseCheck(context)
    const standardRule = await check.getStandardRule()
    Code.expect(standardRule).to.equal(fakeStandardRule)
    Code.expect(context.standardRule).to.equal(await check.getStandardRule())
  })

  lab.test('getTechnicalCompetenceEvidence works correctly', async () => {
    const check = new BaseCheck(context)
    const technicalCompetenceEvidence = await check.getTechnicalCompetenceEvidence()
    Code.expect(technicalCompetenceEvidence).to.equal([fakeAnnotation])
    Code.expect(context.technicalCompetenceEvidence).to.equal(await check.getTechnicalCompetenceEvidence())
  })

  lab.test('getSitePlan works correctly', async () => {
    const check = new BaseCheck(context)
    const sitePlan = await check.getSitePlan()
    Code.expect(sitePlan).to.equal([fakeAnnotation])
    Code.expect(context.sitePlan).to.equal(await check.getSitePlan())
  })

  lab.test('getFirePreventionPlan works correctly', async () => {
    const check = new BaseCheck(context)
    const firePreventionPlan = await check.getFirePreventionPlan()
    Code.expect(firePreventionPlan).to.equal([fakeAnnotation])
    Code.expect(context.firePreventionPlan).to.equal(await check.getFirePreventionPlan())
  })

  lab.test('getWasteRecoveryPlan works correctly', async () => {
    const check = new BaseCheck(context)
    const wasteRecoveryPlan = await check.getWasteRecoveryPlan()
    Code.expect(wasteRecoveryPlan).to.equal([fakeAnnotation])
    Code.expect(context.wasteRecoveryPlan).to.equal(await check.getWasteRecoveryPlan())
  })

  lab.test('getWasteTypesList works correctly', async () => {
    const check = new BaseCheck(context)
    const wasteTypesList = await check.getWasteTypesList()
    Code.expect(wasteTypesList).to.equal([fakeAnnotation])
    Code.expect(context.wasteTypesList).to.equal(await check.getWasteTypesList())
  })

  lab.test('getEnvironmentalRiskAssessment works correctly', async () => {
    const check = new BaseCheck(context)
    const environmentalRiskAssessment = await check.getEnvironmentalRiskAssessment()
    Code.expect(environmentalRiskAssessment).to.equal([fakeAnnotation])
    Code.expect(context.environmentalRiskAssessment).to.equal(await check.getEnvironmentalRiskAssessment())
  })

  lab.test('getNonTechnicalSummary works correctly', async () => {
    const check = new BaseCheck(context)
    const nonTechnicalSummary = await check.getNonTechnicalSummary()
    Code.expect(nonTechnicalSummary).to.equal([fakeAnnotation])
    Code.expect(context.nonTechnicalSummary).to.equal(await check.getNonTechnicalSummary())
  })

  lab.test('getManagementSystem works correctly', async () => {
    const check = new BaseCheck(context)
    const managementSystem = await check.getManagementSystem()
    Code.expect(managementSystem).to.equal(fakeApplicationAnswer)
    Code.expect(context.managementSystem).to.equal(await check.getManagementSystem())
  })

  lab.test('getManagementSystemSummary works correctly', async () => {
    const check = new BaseCheck(context)
    const managementSystemSummary = await check.getManagementSystemSummary()
    Code.expect(managementSystemSummary).to.equal([fakeAnnotation])
    Code.expect(context.managementSystemSummary).to.equal(await check.getManagementSystemSummary())
  })
})
