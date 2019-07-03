'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const AddressDetail = require('../../../src/persistence/entities/addressDetail.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

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

const context = { }

lab.beforeEach(() => {
  testAddressDetail = new AddressDetail(fakeAddressDetailData)

  dynamicsSearchStub = dynamicsDal.search
  dynamicsDal.search = () => {
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

  dynamicsCreateStub = dynamicsDal.create
  dynamicsDal.create = () => testAddressDetailId

  dynamicsUpdateStub = dynamicsDal.update
  dynamicsDal.update = (dataObject) => dataObject.id

  // Create a sinon sandbox to prevent the "spy already wrapped errors" when a "spy.calledWith" fails
  sandbox = sinon.createSandbox()
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the spies are removed correctly
  sandbox.restore()

  // Restore stubbed methods
  dynamicsDal.create = dynamicsCreateStub
  dynamicsDal.search = dynamicsSearchStub
  dynamicsDal.update = dynamicsUpdateStub
})

lab.experiment('AddressDetail Entity tests:', () => {
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

  lab.test('save() method saves a new AddressDetail object', async () => {
    const spy = sandbox.spy(dynamicsDal, 'create')
    await testAddressDetail.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddressDetail.id).to.equal(testAddressDetailId)
  })

  lab.test('save() method updates an existing AddressDetail object', async () => {
    const spy = sandbox.spy(dynamicsDal, 'update')
    testAddressDetail.id = testAddressDetailId
    await testAddressDetail.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testAddressDetail.id).to.equal(testAddressDetailId)
  })
})
