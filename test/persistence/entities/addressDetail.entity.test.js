'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const INDIVIDUAL_PERMIT_HOLDER_TYPE = 910400002
const BILLING_INVOICING_ADDRESS_TYPE = 910400004
const COMPANY_SECRETARY_EMAIL_ADDRESS_TYPE = 910400006
const PRIMARY_CONTACT_TELEPHONE_NUMBER_ADDRESS_TYPE = 910400007
const DESIGNATED_MEMBER_EMAIL_ADDRESS_TYPE = 910400008

const AddressDetail = require('../../../src/persistence/entities/addressDetail.entity')
const DynamicsDalService = require('../../../src/services/dynamicsDal.service')

let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub
let sandbox

let testAddressDetail
const fakeAddressDetailData = {
  email: 'EMAIL',
  telephone: 'PHONE_NUMBER',
  type: 'TYPE',
  addressName: 'ADDRESS_NAME',
  firstName: 'FIRSTNAME',
  lastName: 'LASTNAME',
  jobTitle: 'Inspector',
  applicationId: 'APPLICATION_ID',
  addressId: 'ADDRESS_ID'
}
const testAddressDetailId = 'ADDRESS_DETAIL_ID'

const context = { authToken: 'AUTH_TOKEN' }

lab.beforeEach(() => {
  testAddressDetail = new AddressDetail(fakeAddressDetailData)

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics AddressDetail object
    return {
      value: [{
        defra_addressdetailsid: fakeAddressDetailData.id,
        _defra_applicationid_value: fakeAddressDetailData.applicationId,
        defra_addresstype: fakeAddressDetailData.type,
        emailaddress: fakeAddressDetailData.email,
        defra_phone: fakeAddressDetailData.telephone,
        defra_name: fakeAddressDetailData.addressName,
        defra_jobtitle: fakeAddressDetailData.jobTitle,
        defra_firstName: fakeAddressDetailData.firstName,
        defra_lastName: fakeAddressDetailData.lastName,
        _defra_address_value: fakeAddressDetailData.addressId
      }]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => testAddressDetailId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject) => dataObject.id

  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()

  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('AddressDetail Model tests:', () => {
  lab.test('Constructor creates a AddressDetail object correctly', () => {
    const emptyAddressDetail = new AddressDetail({})
    Code.expect(emptyAddressDetail.email).to.be.undefined()

    const { type, email, firstName, lastName, addressName, telephone, jobTitle, applicationId } = fakeAddressDetailData
    Code.expect(testAddressDetail.type).to.equal(type)
    Code.expect(testAddressDetail.email).to.equal(email)
    Code.expect(testAddressDetail.addressName).to.equal(addressName)
    Code.expect(testAddressDetail.firstName).to.equal(firstName)
    Code.expect(testAddressDetail.lastName).to.equal(lastName)
    Code.expect(testAddressDetail.telephone).to.equal(telephone)
    Code.expect(testAddressDetail.jobTitle).to.equal(jobTitle)
    Code.expect(testAddressDetail.applicationId).to.equal(applicationId)
  })

  lab.test('getByApplicationIdAndType() method returns a single AddressDetail object', async () => {
    const spy = sandbox.spy(DynamicsDalService.prototype, 'search')
    const { applicationId, type, email } = fakeAddressDetailData
    const addressDetail = await AddressDetail.getByApplicationIdAndType(context, applicationId, type)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(addressDetail.email).to.equal(email)
  })

  lab.test(`getCompanySecretaryDetails() method calls getByApplicationIdAndType() method with type of ${COMPANY_SECRETARY_EMAIL_ADDRESS_TYPE}`, async () => {
    const spy = sandbox.spy(AddressDetail, 'getByApplicationIdAndType')
    const { applicationId } = fakeAddressDetailData
    await AddressDetail.getCompanySecretaryDetails(context, applicationId)
    Code.expect(spy.calledWith(context, applicationId, COMPANY_SECRETARY_EMAIL_ADDRESS_TYPE)).to.equal(true)
  })

  lab.test(`getCompanySecretaryDetails() method creates a new AddressDetail with type of ${COMPANY_SECRETARY_EMAIL_ADDRESS_TYPE}`, async () => {
    sandbox.stub(AddressDetail, 'getByApplicationIdAndType').callsFake(() => {})
    const { applicationId } = fakeAddressDetailData
    const addressDetail = await AddressDetail.getCompanySecretaryDetails(context, applicationId)
    Code.expect(addressDetail.type).to.equal(COMPANY_SECRETARY_EMAIL_ADDRESS_TYPE)
  })

  lab.test(`getPrimaryContactDetails() method calls getByApplicationIdAndType() method with type of ${PRIMARY_CONTACT_TELEPHONE_NUMBER_ADDRESS_TYPE}`, async () => {
    const spy = sandbox.spy(AddressDetail, 'getByApplicationIdAndType')
    const { applicationId } = fakeAddressDetailData
    await AddressDetail.getPrimaryContactDetails(context, applicationId)
    Code.expect(spy.calledWith(context, applicationId, PRIMARY_CONTACT_TELEPHONE_NUMBER_ADDRESS_TYPE)).to.equal(true)
  })

  lab.test(`getPrimaryContactDetails() method creates a new AddressDetail with type of ${PRIMARY_CONTACT_TELEPHONE_NUMBER_ADDRESS_TYPE}`, async () => {
    sandbox.stub(AddressDetail, 'getByApplicationIdAndType').callsFake(() => {})
    const { applicationId } = fakeAddressDetailData
    const addressDetail = await AddressDetail.getPrimaryContactDetails(context, applicationId)
    Code.expect(addressDetail.type).to.equal(PRIMARY_CONTACT_TELEPHONE_NUMBER_ADDRESS_TYPE)
  })

  lab.test(`getBillingInvoicingDetails() method calls getByApplicationIdAndType() method with type of ${BILLING_INVOICING_ADDRESS_TYPE}`, async () => {
    const spy = sandbox.spy(AddressDetail, 'getByApplicationIdAndType')
    const { applicationId } = fakeAddressDetailData
    await AddressDetail.getBillingInvoicingDetails(context, applicationId)
    Code.expect(spy.calledWith(context, applicationId, BILLING_INVOICING_ADDRESS_TYPE)).to.equal(true)
  })

  lab.test(`getBillingInvoicingDetails() method creates a new AddressDetail with type of ${BILLING_INVOICING_ADDRESS_TYPE}`, async () => {
    sandbox.stub(AddressDetail, 'getByApplicationIdAndType').callsFake(() => {})
    const { applicationId } = fakeAddressDetailData
    const addressDetail = await AddressDetail.getBillingInvoicingDetails(context, applicationId)
    Code.expect(addressDetail.type).to.equal(BILLING_INVOICING_ADDRESS_TYPE)
  })

  lab.test(`getDesignatedMemberDetails() method calls getByApplicationIdAndType() method with type of ${DESIGNATED_MEMBER_EMAIL_ADDRESS_TYPE}`, async () => {
    const spy = sandbox.spy(AddressDetail, 'getByApplicationIdAndType')
    const { applicationId } = fakeAddressDetailData
    await AddressDetail.getDesignatedMemberDetails(context, applicationId)
    Code.expect(spy.calledWith(context, applicationId, DESIGNATED_MEMBER_EMAIL_ADDRESS_TYPE)).to.equal(true)
  })

  lab.test(`getDesignatedMemberDetails() method creates a new AddressDetail with type of ${DESIGNATED_MEMBER_EMAIL_ADDRESS_TYPE}`, async () => {
    sandbox.stub(AddressDetail, 'getByApplicationIdAndType').callsFake(() => {})
    const { applicationId } = fakeAddressDetailData
    const addressDetail = await AddressDetail.getDesignatedMemberDetails(context, applicationId)
    Code.expect(addressDetail.type).to.equal(DESIGNATED_MEMBER_EMAIL_ADDRESS_TYPE)
  })

  lab.test(`getIndividualPermitHolderDetails() method calls getByApplicationIdAndType() method with type of ${INDIVIDUAL_PERMIT_HOLDER_TYPE}`, async () => {
    const spy = sandbox.spy(AddressDetail, 'getByApplicationIdAndType')
    const { applicationId } = fakeAddressDetailData
    await AddressDetail.getIndividualPermitHolderDetails(context, applicationId)
    Code.expect(spy.calledWith(context, applicationId, INDIVIDUAL_PERMIT_HOLDER_TYPE)).to.equal(true)
  })

  lab.test(`getIndividualPermitHolderDetails() method creates a new AddressDetail with type of ${INDIVIDUAL_PERMIT_HOLDER_TYPE}`, async () => {
    sandbox.stub(AddressDetail, 'getByApplicationIdAndType').callsFake(() => {})
    const { applicationId } = fakeAddressDetailData
    const addressDetail = await AddressDetail.getIndividualPermitHolderDetails(context, applicationId)
    Code.expect(addressDetail.type).to.equal(INDIVIDUAL_PERMIT_HOLDER_TYPE)
  })

  lab.test('save() method saves a new AddressDetail object', async () => {
    const spy = sandbox.spy(DynamicsDalService.prototype, 'create')
    await testAddressDetail.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddressDetail.id).to.equal(testAddressDetailId)
  })

  lab.test('save() method updates an existing AddressDetail object', async () => {
    const spy = sandbox.spy(DynamicsDalService.prototype, 'update')
    testAddressDetail.id = testAddressDetailId
    await testAddressDetail.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddressDetail.id).to.equal(testAddressDetailId)
  })
})