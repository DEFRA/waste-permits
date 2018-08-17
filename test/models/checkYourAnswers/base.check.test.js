'use strict'

const Merge = require('deepmerge')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Account = require('../../../src/models/account.model')
const Address = require('../../../src/models/address.model')
const AddressDetail = require('../../../src/models/addressDetail.model')
const Annotation = require('../../../src/models/annotation.model')
const Application = require('../../../src/models/application.model')
const ApplicationContact = require('../../../src/models/applicationContact.model')
const Contact = require('../../../src/models/contact.model')
const Location = require('../../../src/models/location.model')
const LocationDetail = require('../../../src/models/locationDetail.model')
const StandardRule = require('../../../src/models/standardRule.model')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const day = 1
const month = 2
const year = 1998
const fakeDirector = {
  id: 'DIRECTOR_ID',
  dob: { month, year }
}
const fakeAccount = {
  id: 'ACCOUNT_ID',
  companyNumber: 'COMPANY_NUMBER'
}
const fakeApplication = {
  id: 'APPLICATION_ID',
  agentId: 'AGENT_ID',
  contactId: 'CONTACT_ID',
  declaration: true
}
const fakeApplicationContact = {
  directorDob: `${year}-${month}-${day}`
}
const fakeContact = {
  id: 'CONTACT_ID',
  firstName: 'FIRSTNAME',
  lastName: 'LASTNAME'
}
const fakeCompanies = [new Account(fakeAccount)]
const fakeCompanySecretary = {
  id: 'COMPANY_SECRETARY_ID'
}
const fakePrimaryContact = {
  id: 'PRIMARY_CONTACT_ID'
}
const fakeIndividualPermitHolder = {
  id: 'PERMIT_HOLDER_ID'
}
const fakeIndividualPermitHolderDetails = {
  id: 'PERMIT_HOLDER_DETAILS_ID'
}
const fakeRegisteredComapanyAddressDetails = {
  id: 'REGISTERED_ADDRESS_ID'
}
const fakeDesignatedMemberDetails = {
  id: 'DESIGNATED_MEMBER_ID'
}
const fakePartnerDetails = {
  id: 'PARTNER_DETAILS_ID',
  email: 'EMAIL',
  telephone: 'TELEPHONE'
}
const fakeBillingInvoicing = {
  id: 'BILLING_INVOICING_ID'
}
const fakeLocation = {
  id: 'LOCATION_ID',
  applicationLineId: 'APPLICATION_LINE_ID'
}
const fakeLocationDetail = {
  id: 'LOCATION_DETAIL_ID'
}
const fakeAddress = {
  id: 'ADDRESS_ID'
}
const fakePermitHolderType = {
  id: 'PERMIT_HOLDER_TYPE'
}
const fakeStandardRule = {
  id: 'STANDARD_RULE_ID',
  code: 'CODE',
  codeForId: 'code'
}
const fakeAnnotation = {
  id: 'ANNOTATION_ID'
}
let sandbox
let context

lab.beforeEach(() => {
  context = {}

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Account, 'getById').value(() => new Account(fakeAccount))
  sandbox.stub(Account, 'getByApplicationId').value(() => new Account(fakeAccount))
  sandbox.stub(Account.prototype, 'listLinked').value(() => [new Account(fakeAccount)])
  sandbox.stub(AddressDetail, 'getCompanyRegisteredDetails').value(() => new AddressDetail(fakeRegisteredComapanyAddressDetails))
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress))
  sandbox.stub(AddressDetail, 'getCompanySecretaryDetails').value(() => new AddressDetail(fakeCompanySecretary))
  sandbox.stub(AddressDetail, 'getPrimaryContactDetails').value(() => new AddressDetail(fakePrimaryContact))
  sandbox.stub(AddressDetail, 'getBillingInvoicingDetails').value(() => new AddressDetail(fakeBillingInvoicing))
  sandbox.stub(AddressDetail, 'getIndividualPermitHolderDetails').value(() => new AddressDetail(fakeIndividualPermitHolderDetails))
  sandbox.stub(AddressDetail, 'getDesignatedMemberDetails').value(() => new AddressDetail(fakeDesignatedMemberDetails))
  sandbox.stub(AddressDetail, 'getPartnerDetails').value(() => new AddressDetail(fakePartnerDetails))
  sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [new Annotation(fakeAnnotation)])
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(ApplicationContact, 'get').value(() => new ApplicationContact(fakeApplicationContact))
  sandbox.stub(ApplicationContact, 'listByApplicationId').value(() => [new ApplicationContact(fakeApplicationContact)])
  sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
  sandbox.stub(Contact, 'getIndividualPermitHolderByApplicationId').value(() => new Contact(fakeIndividualPermitHolder))
  sandbox.stub(Contact, 'list').value(() => [new Contact(fakeDirector)])
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => new StandardRule(fakeStandardRule))
  sandbox.stub(Location, 'getByApplicationId').value(() => new Location(fakeLocation))
  sandbox.stub(LocationDetail, 'getByLocationId').value(() => new LocationDetail(fakeLocationDetail))
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

  lab.test('getContact works correctly', async () => {
    const check = new BaseCheck(context)
    const contact = await check.getContact()
    Code.expect(contact).to.equal(fakeContact)
    Code.expect(context.contact).to.equal(await check.getContact())
  })

  lab.test('getCompanySecretaryDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const companySecretaryDetails = await check.getCompanySecretaryDetails()
    Code.expect(companySecretaryDetails).to.equal(fakeCompanySecretary)
    Code.expect(context.companySecretaryDetails).to.equal(await check.getCompanySecretaryDetails())
  })

  lab.test('getCompanyRegisteredAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const companyRegisteredAddress = await check.getCompanyRegisteredAddress()
    Code.expect(companyRegisteredAddress).to.equal(fakeAddress)
    Code.expect(context.companyRegisteredAddress).to.equal(await check.getCompanyRegisteredAddress())
  })

  lab.test('getCompanies works correctly', async () => {
    const check = new BaseCheck(context)
    const companies = await check.getCompanies()
    Code.expect(companies).to.equal(fakeCompanies)
    Code.expect(context.companies).to.equal(await check.getCompanies())
  })

  lab.test('getDesignatedMemberDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const designatedMemberDetails = await check.getDesignatedMemberDetails()
    Code.expect(designatedMemberDetails).to.equal(fakeDesignatedMemberDetails)
    Code.expect(context.designatedMemberDetails).to.equal(await check.getDesignatedMemberDetails())
  })

  lab.test('getIndividualPermitHolderDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const individualPermitHolderDetails = await check.getIndividualPermitHolderDetails()
    Code.expect(individualPermitHolderDetails).to.equal(fakeIndividualPermitHolderDetails)
    Code.expect(context.individualPermitHolderDetails).to.equal(await check.getIndividualPermitHolderDetails())
  })

  lab.test('getMembers works correctly', async () => {
    const check = new BaseCheck(context)
    const members = await check.getMembers()
    Code.expect(members).to.equal([new ApplicationContact(Merge({ dob: { day } }, fakeDirector))])
    Code.expect(context.members).to.equal(await check.getMembers())
  })

  lab.test('getPartners works correctly', async () => {
    const check = new BaseCheck(context)
    const partners = await check.getPartners()
    Code.expect(partners).to.equal([ {
      name: `${fakeContact.firstName} ${fakeContact.lastName}`,
      email: fakePartnerDetails.email,
      telephone: fakePartnerDetails.telephone,
      dob: '01/02/1998',
      address: fakeAddress
    }])
    Code.expect(context.partners).to.equal(await check.getPartners())
  })

  lab.test('getPermitHolderType works correctly', async () => {
    context.permitHolderType = fakePermitHolderType
    const check = new BaseCheck(context)
    const permitHolderType = await check.getPermitHolderType()
    Code.expect(permitHolderType).to.equal(fakePermitHolderType)
    Code.expect(context.permitHolderType).to.equal(await check.getPermitHolderType())
  })

  lab.test('getPrimaryContactDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const primaryContactDetails = await check.getPrimaryContactDetails()
    Code.expect(primaryContactDetails).to.equal(fakePrimaryContact)
    Code.expect(context.primaryContactDetails).to.equal(await check.getPrimaryContactDetails())
  })

  lab.test('getIndividualPermitHolder works correctly', async () => {
    const check = new BaseCheck(context)
    const individualPermitHolder = await check.getIndividualPermitHolder()
    Code.expect(individualPermitHolder).to.equal(fakeIndividualPermitHolder)
    Code.expect(context.individualPermitHolder).to.equal(await check.getIndividualPermitHolder())
  })

  lab.test('getIndividualPermitHolderAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const individualPermitHolderAddress = await check.getIndividualPermitHolderAddress()
    Code.expect(individualPermitHolderAddress).to.equal(fakeAddress)
    Code.expect(context.individualPermitHolderAddress).to.equal(await check.getIndividualPermitHolderAddress())
  })

  lab.test('getBillingInvoicingDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const billingInvoicingDetails = await check.getBillingInvoicingDetails()
    Code.expect(billingInvoicingDetails).to.equal(fakeBillingInvoicing)
    Code.expect(context.billingInvoicingDetails).to.equal(await check.getBillingInvoicingDetails())
  })

  lab.test('getDirectors works correctly', async () => {
    const check = new BaseCheck(context)
    const directors = await check.getDirectors()
    Code.expect(directors).to.equal([new ApplicationContact(Merge({ dob: { day } }, fakeDirector))])
    Code.expect(context.directors).to.equal(await check.getDirectors())
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

  lab.test('getLocationAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const locationAddress = await check.getLocationAddress()
    Code.expect(locationAddress).to.equal(fakeAddress)
    Code.expect(context.locationAddress).to.equal(await check.getLocationAddress())
  })

  lab.test('getInvoiceAddress works correctly', async () => {
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
})
