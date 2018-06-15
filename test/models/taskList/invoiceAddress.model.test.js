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

let sandbox

const request = {app: {data: {}}}
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
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => fakeAddress1.id)
  sandbox.stub(DynamicsDalService.prototype, 'update').value(() => fakeAddress1.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => new ApplicationLine({ id: applicationLineId }))
  sandbox.stub(AddressDetail, 'getByApplicationIdAndType').value(() => new AddressDetail({ addressId: 'ADDRESS_ID' }))
  sandbox.stub(Address.prototype, 'save').value(() => undefined)
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress1))
  sandbox.stub(Address, 'getByUprn').value(() => new Address(fakeAddress1))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress1),
    new Address(fakeAddress2),
    new Address(fakeAddress3)
  ])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
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
      const spy = sinon.spy(DynamicsDalService.prototype, 'update')
      await InvoiceAddress.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
    })

    lab.test('saveSelectedAddress() method correctly saves an invoice address that is not already in Dynamics', async () => {
      Address.getByUprn = () => undefined
      const addressDto = {
        uprn: fakeAddress1.uprn,
        postcode: fakeAddress1.postcode
      }
      const spy = sinon.spy(DynamicsDalService.prototype, 'create')
      await InvoiceAddress.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
    })

    lab.test('saveManualAddress() method correctly creates an invoice address from a selected address that is already in Dynamics', async () => {
      const addressDto = {
        uprn: fakeAddress1.uprn,
        postcode: fakeAddress1.postcode
      }
      const spy = sinon.spy(DynamicsDalService.prototype, 'create')
      await InvoiceAddress.saveManualAddress(request, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
    })

    lab.test('saveManualAddress() method correctly saves an invoice address that is not already in Dynamics', async () => {
      Address.getByUprn = () => undefined
      const addressDto = {
        postcode: fakeAddress1.postcode
      }
      const spy = sinon.spy(DynamicsDalService.prototype, 'create')
      await InvoiceAddress.saveManualAddress(request, applicationId, applicationLineId, addressDto)
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
