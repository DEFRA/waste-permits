'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Account = require('../../../src/persistence/entities/account.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const Annotation = require('../../../src/persistence/entities/annotation.entity')
const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationAnswer = require('../../../src/persistence/entities/applicationAnswer.entity')
const Location = require('../../../src/persistence/entities/location.entity')
const LocationDetail = require('../../../src/persistence/entities/locationDetail.entity')
const StandardRule = require('../../../src/persistence/entities/standardRule.entity')

const ContactDetail = require('../../../src/models/contactDetail.model')
const CharityDetail = require('../../../src/models/charityDetail.model')
const NeedToConsult = require('../../../src/models/needToConsult.model')
const McpBusinessType = require('../../../src/models/mcpBusinessType.model')
const AirQualityManagementArea = require('../../../src/models/airQualityManagementArea.model')

const RecoveryService = require('../../../src/services/recovery.service')

const BaseCheck = require('../../../src/models/checkList/base.check')

let context
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  context = mocks.context

  mocks.addressType = {
    TYPE: mocks.contactDetail.type
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Account, 'getById').value(() => mocks.account)
  sandbox.stub(Account, 'getByApplicationId').value(() => mocks.account)
  sandbox.stub(Account.prototype, 'listLinked').value(() => [mocks.account])
  sandbox.stub(Address, 'getById').value(() => mocks.address)
  sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [mocks.annotation])
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(ApplicationAnswer, 'getByQuestionCode').value(() => mocks.applicationAnswers[0])
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.standardRule)
  sandbox.stub(Location, 'getByApplicationId').value(() => mocks.location)
  sandbox.stub(LocationDetail, 'getByLocationId').value(() => new LocationDetail(mocks.locationDetail))
  sandbox.stub(ContactDetail, 'get').value(() => mocks.contactDetail)
  sandbox.stub(ContactDetail, 'list').value(() => [mocks.contactDetail])
  sandbox.stub(CharityDetail, 'get').value(() => mocks.charityDetail)
  sandbox.stub(NeedToConsult, 'get').value(() => mocks.needToConsult)
  sandbox.stub(McpBusinessType, 'get').value(() => mocks.mcpBusinessType)
  sandbox.stub(AirQualityManagementArea, 'get').value(() => mocks.airQualityManagementArea)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
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
    delete context.application
    const check = new BaseCheck(context)
    const application = await check.getApplication()
    Code.expect(application).to.equal(mocks.application)
    Code.expect(context.application).to.equal(await check.getApplication())
  })

  lab.test('getAgentAccount works correctly', async () => {
    delete context.agentAccount
    const check = new BaseCheck(context)
    const agentAccount = await check.getAgentAccount()
    Code.expect(agentAccount).to.equal(mocks.account)
    Code.expect(context.agentAccount).to.equal(await check.getAgentAccount())
  })

  lab.test('getContactDetails works correctly', async () => {
    delete context.contactDetails
    const check = new BaseCheck(context)
    const contactDetail = await check.getContactDetails(mocks.addressType)
    Code.expect(contactDetail).to.equal(mocks.contactDetail)
    Code.expect(context.contactDetails[0]).to.equal(await check.getContactDetails(mocks.addressType))
  })

  lab.test('listContactDetails works correctly', async () => {
    delete context.contactDetails
    const check = new BaseCheck(context)
    const contactDetails = await check.listContactDetails(mocks.addressType)
    Code.expect(contactDetails).to.equal([mocks.contactDetail])
    Code.expect(context.contactDetails).to.equal(await check.listContactDetails(mocks.addressType))
  })

  lab.test('getCompanyRegisteredAddress works correctly', async () => {
    delete context.companyRegisteredAddress
    const check = new BaseCheck(context)
    const companyRegisteredAddress = await check.getCompanyRegisteredAddress()
    Code.expect(companyRegisteredAddress).to.equal(mocks.contactDetail)
    Code.expect(context.companyRegisteredAddress).to.equal(await check.getCompanyRegisteredAddress())
  })

  lab.test('getCompanies works correctly', async () => {
    delete context.companies
    const check = new BaseCheck(context)
    const companies = await check.getCompanies()
    Code.expect(companies).to.equal([mocks.account])
    Code.expect(context.companies).to.equal(await check.getCompanies())
  })

  lab.test('getPermitHolderType works correctly', async () => {
    delete context.permitHolderType
    context.permitHolderType = mocks.permitHolderType
    const check = new BaseCheck(context)
    const permitHolderType = await check.getPermitHolderType()
    Code.expect(permitHolderType).to.equal(mocks.permitHolderType)
    Code.expect(context.permitHolderType).to.equal(await check.getPermitHolderType())
  })

  lab.test('getBillingInvoicingDetails works correctly', async () => {
    delete context.contactDetails
    mocks.contactDetail.type = 910400004
    const check = new BaseCheck(context)
    const billingInvoicingDetails = await check.getBillingInvoicingDetails()
    Code.expect(billingInvoicingDetails).to.equal(mocks.contactDetail)
    Code.expect(context.contactDetails[0]).to.equal(await check.getBillingInvoicingDetails())
  })

  lab.test('getLocation works correctly', async () => {
    delete context.location
    const check = new BaseCheck(context)
    const location = await check.getLocation()
    Code.expect(location).to.equal(mocks.location)
    Code.expect(context.location).to.equal(await check.getLocation())
  })

  lab.test('getLocationDetail works correctly', async () => {
    delete context.locationDetail
    const check = new BaseCheck(context)
    const locationDetail = await check.getLocationDetail()
    Code.expect(locationDetail).to.equal(mocks.locationDetail)
    Code.expect(context.locationDetail).to.equal(await check.getLocationDetail())
  })

  lab.test('getMainAddress works correctly', async () => {
    delete context.mainAddress
    mocks.contactDetail.type = 910400001
    const check = new BaseCheck(context)
    const mainAddress = await check.getMainAddress()
    Code.expect(mainAddress).to.equal(mocks.contactDetail)
    Code.expect(context.mainAddress).to.equal(await check.getMainAddress())
  })

  lab.test('getLocationAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const locationAddress = await check.getLocationAddress()
    Code.expect(locationAddress).to.equal(mocks.address)
    Code.expect(context.locationAddress).to.equal(await check.getLocationAddress())
  })

  lab.test('getInvoiceAddress works correctly', async () => {
    delete context.invoiceAddress
    mocks.contactDetail.type = 910400004
    const check = new BaseCheck(context)
    const invoiceAddress = await check.getInvoiceAddress()
    Code.expect(invoiceAddress).to.equal(mocks.address)
    Code.expect(context.invoiceAddress).to.equal(await check.getInvoiceAddress())
  })

  lab.test('getStandardRule works correctly', async () => {
    delete context.standardRule
    const check = new BaseCheck(context)
    const standardRule = await check.getStandardRule()
    Code.expect(standardRule).to.equal(mocks.standardRule)
    Code.expect(context.standardRule).to.equal(await check.getStandardRule())
  })

  lab.test('getTechnicalCompetenceEvidence works correctly', async () => {
    delete context.technicalCompetenceEvidence
    const check = new BaseCheck(context)
    const technicalCompetenceEvidence = await check.getTechnicalCompetenceEvidence()
    Code.expect(technicalCompetenceEvidence).to.equal([mocks.annotation])
    Code.expect(context.technicalCompetenceEvidence).to.equal(await check.getTechnicalCompetenceEvidence())
  })

  lab.test('getSitePlan works correctly', async () => {
    delete context.sitePlan
    const check = new BaseCheck(context)
    const sitePlan = await check.getSitePlan()
    Code.expect(sitePlan).to.equal([mocks.annotation])
    Code.expect(context.sitePlan).to.equal(await check.getSitePlan())
  })

  lab.test('getFirePreventionPlan works correctly', async () => {
    delete context.firePreventionPlan
    const check = new BaseCheck(context)
    const firePreventionPlan = await check.getFirePreventionPlan()
    Code.expect(firePreventionPlan).to.equal([mocks.annotation])
    Code.expect(context.firePreventionPlan).to.equal(await check.getFirePreventionPlan())
  })

  lab.test('getWasteRecoveryPlan works correctly', async () => {
    delete context.wasteRecoveryPlan
    const check = new BaseCheck(context)
    const wasteRecoveryPlan = await check.getWasteRecoveryPlan()
    Code.expect(wasteRecoveryPlan).to.equal([mocks.annotation])
    Code.expect(context.wasteRecoveryPlan).to.equal(await check.getWasteRecoveryPlan())
  })

  lab.test('getEnergyEfficiencyReport works correctly', async () => {
    delete context.energyEfficiencyReport
    const check = new BaseCheck(context)
    const energyEfficiencyReport = await check.getEnergyEfficiencyReport()
    Code.expect(energyEfficiencyReport).to.equal([mocks.annotation])
    Code.expect(context.energyEfficiencyReport).to.equal(await check.getEnergyEfficiencyReport())
  })

  lab.test('getAirDispersionModellingReport works correctly', async () => {
    delete context.airDispersionModellingReport
    const check = new BaseCheck(context)
    const airDispersionModellingReport = await check.getAirDispersionModellingReport()
    Code.expect(airDispersionModellingReport).to.equal([mocks.annotation])
    Code.expect(context.airDispersionModellingReport).to.equal(await check.getAirDispersionModellingReport())
  })

  lab.test('getScreeningTool works correctly', async () => {
    delete context.screeningTool
    const check = new BaseCheck(context)
    const screeningTool = await check.getScreeningTool()
    Code.expect(screeningTool).to.equal([mocks.annotation])
    Code.expect(context.screeningTool).to.equal(await check.getScreeningTool())
  })

  lab.test('getBestAvailableTechniquesAssessment works correctly', async () => {
    delete context.bestAvailableTechniquesAssessment
    const check = new BaseCheck(context)
    const bestAvailableTechniquesAssessment = await check.getBestAvailableTechniquesAssessment()
    Code.expect(bestAvailableTechniquesAssessment).to.equal([mocks.annotation])
    Code.expect(context.bestAvailableTechniquesAssessment).to.equal(await check.getBestAvailableTechniquesAssessment())
  })

  lab.test('getWasteTypesList works correctly', async () => {
    delete context.wasteTypesList
    const check = new BaseCheck(context)
    const wasteTypesList = await check.getWasteTypesList()
    Code.expect(wasteTypesList).to.equal([mocks.annotation])
    Code.expect(context.wasteTypesList).to.equal(await check.getWasteTypesList())
  })

  lab.test('getEnvironmentalRiskAssessment works correctly', async () => {
    delete context.environmentalRiskAssessment
    const check = new BaseCheck(context)
    const environmentalRiskAssessment = await check.getEnvironmentalRiskAssessment()
    Code.expect(environmentalRiskAssessment).to.equal([mocks.annotation])
    Code.expect(context.environmentalRiskAssessment).to.equal(await check.getEnvironmentalRiskAssessment())
  })

  lab.test('getNonTechnicalSummary works correctly', async () => {
    delete context.nonTechnicalSummary
    const check = new BaseCheck(context)
    const nonTechnicalSummary = await check.getNonTechnicalSummary()
    Code.expect(nonTechnicalSummary).to.equal([mocks.annotation])
    Code.expect(context.nonTechnicalSummary).to.equal(await check.getNonTechnicalSummary())
  })

  lab.test('getManagementSystem works correctly', async () => {
    const check = new BaseCheck(context)
    const managementSystem = await check.getManagementSystem()
    Code.expect(managementSystem).to.equal(mocks.applicationAnswers[0])
    Code.expect(context.managementSystem).to.equal(await check.getManagementSystem())
  })

  lab.test('getManagementSystemSummary works correctly', async () => {
    delete context.managementSystemSummary
    const check = new BaseCheck(context)
    const managementSystemSummary = await check.getManagementSystemSummary()
    Code.expect(managementSystemSummary).to.equal([mocks.annotation])
    Code.expect(context.managementSystemSummary).to.equal(await check.getManagementSystemSummary())
  })

  lab.test('getMcpType works correctly', async () => {
    const check = new BaseCheck(context)
    const mcpType = await check.getMcpType()
    Code.expect(mcpType).to.equal(mocks.taskDeterminants.mcpType)
    Code.expect(context.taskDeterminants.mcpType).to.equal(await check.getMcpType())
  })

  lab.test('getNeedToConsult works correctly', async () => {
    delete context.needToConsult
    const check = new BaseCheck(context)
    const needToConsult = await check.getNeedToConsult()
    Code.expect(needToConsult).to.equal(mocks.needToConsult)
    Code.expect(context.needToConsult).to.equal(await check.getNeedToConsult())
  })

  lab.test('getAirQualityManagementArea works correctly', async () => {
    delete context.airQualityManagementArea
    const check = new BaseCheck(context)
    const airQualityManagementArea = await check.getAirQualityManagementArea()
    Code.expect(airQualityManagementArea).to.equal(mocks.airQualityManagementArea)
    Code.expect(context.airQualityManagementArea).to.equal(await check.getAirQualityManagementArea())
  })

  lab.test('getCharityDetails works correctly', async () => {
    delete context.charityDetails
    const check = new BaseCheck(context)
    const charityDetail = await check.getCharityDetails()
    Code.expect(charityDetail).to.equal(mocks.charityDetail)
    Code.expect(context.charityDetails).to.equal(await check.getCharityDetails())
  })

  lab.test('getMcpDetails works correctly', async () => {
    delete context.mcpDetails
    const check = new BaseCheck(context)
    const mcpDetails = await check.getMcpDetails()
    Code.expect(mcpDetails).to.equal([mocks.annotation])
    Code.expect(context.mcpDetails).to.equal(await check.getMcpDetails())
  })

  lab.test('getMcpBusinessType works correctly', async () => {
    delete context.mcpBusinessType
    const check = new BaseCheck(context)
    const mcpBusinessType = await check.getMcpBusinessType()
    Code.expect(mcpBusinessType).to.equal(mocks.mcpBusinessType)
    Code.expect(context.mcpBusinessType).to.equal(await check.getMcpBusinessType())
  })

  lab.test('getTechnicalManagers works correctly', async () => {
    delete context.technicalManagers
    const check = new BaseCheck(context)
    const technicalManagers = await check.getTechnicalManagers()
    Code.expect(technicalManagers).to.equal([mocks.annotation])
    Code.expect(context.technicalManagers).to.equal(await check.getTechnicalManagers())
  })
})
