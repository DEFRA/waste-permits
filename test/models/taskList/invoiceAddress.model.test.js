'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Address = require('../../../src/models/address.model')
const AddressDetail = require('../../../src/models/addressDetail.model')
const InvoiceAddress = require('../../../src/models/taskList/invoiceAddress.model')

let dynamicsCreateStub
let dynamicsUpdateStub
let applicationLineGetByIdStub
let addressDetailGetByApplicationIdAndTypeStub
let addressGetByIdStub
let addressGetByUprnStub
let addressListByPostcodeStub

const request = undefined
const authToken = 'THE_AUTH_TOKEN'
const applicationId = 'APPLICATION_ID'
const applicationLineId = 'APPLICATION_LINE_ID'

let fakeAddress1 = {
  id: 'ADDRESS_ID_1',
  buildingNameOrNumber: '101',
  addressLine1: 'FIRST_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY1',
  postcode: 'AB12 1AA',
  uprn: 'UPRN1',
  fromAddressLookup: true
}

let fakeAddress2 = {
  id: 'ADDRESS_ID_2',
  buildingNameOrNumber: '102',
  addressLine1: 'SECOND_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY2',
  postcode: 'AB12 2AA',
  uprn: 'UPRN2',
  fromAddressLookup: true
}

let fakeAddress3 = {
  id: 'ADDRESS_ID_3',
  buildingNameOrNumber: '103',
  addressLine1: 'THIRD_ADDRESS_LINE_1',
  addressLine2: undefined,
  townOrCity: 'CITY3',
  postcode: 'AB12 3AA',
  uprn: 'UPRN3',
  fromAddressLookup: true
}

lab.beforeEach(() => {
  // Stub methods
  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => fakeAddress1.id

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = () => fakeAddress1.id

  applicationLineGetByIdStub = ApplicationLine.getById
  ApplicationLine.getById = () => new ApplicationLine({ id: applicationLineId })

  addressDetailGetByApplicationIdAndTypeStub = AddressDetail.getByApplicationIdAndType
  AddressDetail.getByApplicationIdAndType = () => new AddressDetail({ addressId: 'ADDRESS_ID' })

  addressGetByIdStub = Address.getById
  Address.getById = () => new Address(fakeAddress1)

  addressGetByUprnStub = Address.getByUprn
  Address.getByUprn = () => new Address(fakeAddress1)

  addressListByPostcodeStub = Address.listByPostcode
  Address.listByPostcode = () => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ]
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
  ApplicationLine.getById = applicationLineGetByIdStub
  AddressDetail.getByApplicationIdAndType = addressDetailGetByApplicationIdAndTypeStub
  Address.getById = addressGetByIdStub
  Address.getByUprn = addressGetByUprnStub
  Address.listByPostcode = addressListByPostcodeStub
})

lab.experiment('Task List: Invoice Address Model tests:', () => {
  lab.experiment('Model persistence methods:', () => {
    lab.test('getAddress() method correctly retrieves an Address', async () => {
      const address = await InvoiceAddress.getAddress(request, authToken, applicationId)
      Code.expect(address.uprn).to.be.equal(fakeAddress1.uprn)
    })

    lab.test('saveSelectedAddress() method correctly saves an invoice address that is already in Dynamics', async () => {
      const addressDto = {
        uprn: fakeAddress1.uprn,
        postcode: fakeAddress1.postcode
      }
      const spy = sinon.spy(DynamicsDalService.prototype, 'create')
      await InvoiceAddress.saveSelectedAddress(request, authToken, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
    })

    lab.test('saveSelectedAddress() method correctly saves an invoice address that is not already in Dynamics', async () => {
      Address.getByUprn = () => undefined
      const addressDto = {
        uprn: fakeAddress1.uprn,
        postcode: fakeAddress1.postcode
      }
      const spy = sinon.spy(DynamicsDalService.prototype, 'create')
      await InvoiceAddress.saveSelectedAddress(request, authToken, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
    })
  })

  lab.experiment('Completeness:', () => {
    lab.test('updateCompleteness() method updates the task list item completeness', async () => {
      const spy = sinon.spy(DynamicsDalService.prototype, 'update')
      await InvoiceAddress.updateCompleteness(authToken, applicationId, applicationLineId)
      Code.expect(spy.callCount).to.equal(1)
    })

    lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
      const result = await InvoiceAddress.isComplete(authToken, applicationId, applicationLineId)
      Code.expect(result).to.be.true()
    })
  })
})
