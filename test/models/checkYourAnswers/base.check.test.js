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
const CompanyLookupService = require('../../../src/services/companyLookup.service')

const BaseCheck = require('../../../src/models/checkYourAnswers/base.check')
const day = 1
const month = 2
const year = 1998
const fakeDirector = {
  id: 'DIRECTOR_ID',
  dob: {month, year}
}
const fakeAccount = {
  id: 'ACCOUNT_ID',
  companyNumber: 'COMPANY_NUMBER'
}
const fakeApplication = {
  id: 'APPLICATION_ID',
  agentId: 'AGENT_ID',
  contactId: 'CONTACT_ID'
}
const fakeApplicationContact = {
  directorDob: `${year}-${month}-${day}`
}
const fakeContact = {
  id: 'CONTACT_ID'
}
const fakeCompany = {
  id: 'COMPANY_ID'
}
const fakeCompanySecretary = {
  id: 'COMPANY_SECRETARY_ID'
}
const fakePrimaryContact = {
  id: 'PRIMARY_CONTACT_ID'
}
const fakeBillingInvoicing = {
  id: 'BILLING_INVOICING_ID'
}
const fakeLocation = {
  id: 'LOCATION_ID'
}
const fakeLocationDetail = {
  id: 'LOCATION_DETAIL_ID'
}
const fakeAddress = {
  id: 'ADDRESS_ID'
}
const fakeStandardRule = {
  id: 'STANDARD_RULE_ID'
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
  sandbox.stub(Account, 'getById').value(() => Merge({}, fakeAccount))
  sandbox.stub(Account, 'getByApplicationId').value(() => Merge({}, fakeAccount))
  sandbox.stub(Address, 'getById').value(() => Merge({}, fakeAddress))
  sandbox.stub(AddressDetail, 'getCompanySecretaryDetails').value(() => Merge({}, fakeCompanySecretary))
  sandbox.stub(AddressDetail, 'getPrimaryContactDetails').value(() => Merge({}, fakePrimaryContact))
  sandbox.stub(AddressDetail, 'getBillingInvoicingDetails').value(() => Merge({}, fakeBillingInvoicing))
  sandbox.stub(Annotation, 'listByApplicationIdAndSubject').value(() => [Merge({}, fakeAnnotation)])
  sandbox.stub(Application, 'getById').value(() => Merge({}, fakeApplication))
  sandbox.stub(ApplicationContact, 'get').value(() => Merge({}, fakeApplicationContact))
  sandbox.stub(Contact, 'getById').value(() => Merge({}, fakeContact))
  sandbox.stub(Contact, 'list').value(() => [Merge({}, fakeDirector)])
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => Merge({}, fakeStandardRule))
  sandbox.stub(Location, 'getByApplicationId').value(() => Merge({}, fakeLocation))
  sandbox.stub(LocationDetail, 'getByLocationId').value(() => Merge({}, fakeLocationDetail))
  sandbox.stub(CompanyLookupService, 'getCompany').value(() => Merge({}, fakeCompany))
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
    const links = [{path: '/path-1', type: 'type 1'}, {path: '/path-2', type: 'type 2'}]
    const line = check.buildLine({heading, prefix, answers, links})

    Code.expect(line.heading).to.equal(heading)
    Code.expect(line.headingId).to.equal(`section-${prefix}-heading`)

    line.answers.forEach(({answer, answerId}, index) => {
      Code.expect(answer).to.equal(answers[index])
      Code.expect(answerId).to.equal(`section-${prefix}-answer-${index + 1}`)
    })

    line.links.forEach(({link, linkId, linkType}, index) => {
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
  })

  lab.test('getAgentAccount works correctly', async () => {
    const check = new BaseCheck(context)
    const account = await check.getAgentAccount()
    Code.expect(account).to.equal(fakeAccount)
  })

  lab.test('getContact works correctly', async () => {
    const check = new BaseCheck(context)
    const contact = await check.getContact()
    Code.expect(contact).to.equal(fakeContact)
  })

  lab.test('getCompany works correctly', async () => {
    const check = new BaseCheck(context)
    const company = await check.getCompany()
    Code.expect(company).to.equal(fakeCompany)
  })

  lab.test('getCompanySecretaryDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const companySecretary = await check.getCompanySecretaryDetails()
    Code.expect(companySecretary).to.equal(fakeCompanySecretary)
  })

  lab.test('getPrimaryContactDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const primaryContact = await check.getPrimaryContactDetails()
    Code.expect(primaryContact).to.equal(fakePrimaryContact)
  })

  lab.test('getBillingInvoicingDetails works correctly', async () => {
    const check = new BaseCheck(context)
    const billingInvoicing = await check.getBillingInvoicingDetails()
    Code.expect(billingInvoicing).to.equal(fakeBillingInvoicing)
  })

  lab.test('getDirectors works correctly', async () => {
    const check = new BaseCheck(context)
    const directors = await check.getDirectors()
    Code.expect(directors).to.equal([Merge({dob: {day}}, fakeDirector)])
  })

  lab.test('getLocation works correctly', async () => {
    const check = new BaseCheck(context)
    const location = await check.getLocation()
    Code.expect(location).to.equal(fakeLocation)
  })

  lab.test('getLocationDetail works correctly', async () => {
    const check = new BaseCheck(context)
    const locationDetail = await check.getLocationDetail()
    Code.expect(locationDetail).to.equal(fakeLocationDetail)
  })

  lab.test('getLocationAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const locationAddress = await check.getLocationAddress()
    Code.expect(locationAddress).to.equal(fakeAddress)
  })

  lab.test('getInvoiceAddress works correctly', async () => {
    const check = new BaseCheck(context)
    const invoiceAddress = await check.getInvoiceAddress()
    Code.expect(invoiceAddress).to.equal(fakeAddress)
  })

  lab.test('getStandardRule works correctly', async () => {
    const check = new BaseCheck(context)
    const standardRule = await check.getStandardRule()
    Code.expect(standardRule).to.equal(fakeStandardRule)
  })

  lab.test('getTechnicalCompetenceEvidence works correctly', async () => {
    const check = new BaseCheck(context)
    const technicalCompetenceEvidence = await check.getTechnicalCompetenceEvidence()
    Code.expect(technicalCompetenceEvidence).to.equal([fakeAnnotation])
  })

  lab.test('getSitePlan works correctly', async () => {
    const check = new BaseCheck(context)
    const sitePlan = await check.getSitePlan()
    Code.expect(sitePlan).to.equal([fakeAnnotation])
  })

  lab.test('getFirePreventionPlan works correctly', async () => {
    const check = new BaseCheck(context)
    const sitePlan = await check.getFirePreventionPlan()
    Code.expect(sitePlan).to.equal([fakeAnnotation])
  })
})
