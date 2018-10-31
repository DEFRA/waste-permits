'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const InvoiceAddress = require('../../../src/models/taskList/invoiceAddress.task')

const COMPLETENESS_PARAMETER = 'defra_invoicingdetails_completed'

let sandbox

const request = { app: { data: { authToken: 'AUTH_TOKEN' } } }
const applicationId = 'APPLICATION_ID'
const applicationLineId = 'APPLICATION_LINE_ID'
let fakeAddress
let fakeContactDetail

lab.beforeEach(() => {
  fakeAddress = {
    id: 'ADDRESS_ID',
    buildingNameOrNumber: '101',
    addressLine1: 'FIRST_ADDRESS_LINE',
    addressLine2: undefined,
    townOrCity: 'CITY',
    postcode: 'AB12 1AA',
    uprn: 'UPRN',
    fromAddressLookup: true
  }

  fakeContactDetail = {
    id: 'CONTACT_DETAIL_ID',
    addressId: 'ADDRESS_ID'
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(ContactDetail.prototype, 'save').value(() => fakeAddress.id)
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => fakeAddress.id)
  sandbox.stub(DynamicsDalService.prototype, 'update').value(() => fakeAddress.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => new ApplicationLine({ id: applicationLineId }))
  sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(fakeContactDetail))
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(Address.prototype, 'save').value(() => undefined)
  sandbox.stub(Address, 'getById').value(() => new Address(fakeAddress))
  sandbox.stub(Address, 'getByUprn').value(() => new Address(fakeAddress))
  sandbox.stub(Address, 'listByPostcode').value(() => [
    new Address(fakeAddress),
    new Address(fakeAddress),
    new Address(fakeAddress)
  ])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Invoice Address Model tests:', () => {
  lab.experiment('Model persistence methods:', () => {
    lab.test('getAddress() method correctly retrieves an Address', async () => {
      const address = await InvoiceAddress.getAddress(request, applicationId)
      Code.expect(address.uprn).to.be.equal(fakeAddress.uprn)
    })

    lab.test('saveSelectedAddress() method correctly saves an invoice address', async () => {
      const addressDto = {
        uprn: fakeAddress.uprn,
        postcode: fakeAddress.postcode
      }
      const spy = sinon.spy(ContactDetail.prototype, 'save')
      await InvoiceAddress.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
      spy.restore()
    })

    lab.test('saveManualAddress() method correctly saves an invoice address', async () => {
      Address.getByUprn = () => undefined
      const addressDto = {
        postcode: fakeAddress.postcode
      }
      const spy = sinon.spy(ContactDetail.prototype, 'save')
      await InvoiceAddress.saveManualAddress(request, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
      spy.restore()
    })
  })

  lab.experiment('Completeness:', () => {
    lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
      Code.expect(InvoiceAddress.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
    })

    lab.test('checkComplete() method correctly returns FALSE when the address details are not set', async () => {
      fakeContactDetail = {}
      const result = await InvoiceAddress.checkComplete()
      Code.expect(result).to.equal(false)
    })

    lab.test('checkComplete() method correctly returns TRUE when address details are set', async () => {
      const result = await InvoiceAddress.checkComplete()
      Code.expect(result).to.equal(true)
    })
  })
})
