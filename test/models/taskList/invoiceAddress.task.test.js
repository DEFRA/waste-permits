'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Address = require('../../../src/persistence/entities/address.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const InvoiceAddress = require('../../../src/models/taskList/invoiceAddress.task')

let request
let context
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  request = mocks.request
  context = mocks.context

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Address, 'getById').value(async () => mocks.address)
  sandbox.stub(Address, 'getByUprn').value(async () => mocks.address)
  sandbox.stub(Address, 'listByPostcode').value(async () => [mocks.address, mocks.address, mocks.address])
  sandbox.stub(Address.prototype, 'save').value(async () => undefined)
  sandbox.stub(ContactDetail, 'get').value(async () => mocks.contactDetail)
  sandbox.stub(ContactDetail.prototype, 'save').value(async () => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Invoice Address Model tests:', () => {
  lab.experiment('Model persistence methods:', () => {
    lab.test('getAddress() method correctly retrieves an Address', async () => {
      const address = await InvoiceAddress.getAddress(request)
      Code.expect(address.uprn).to.be.equal(mocks.address.uprn)
    })

    lab.test('saveSelectedAddress() method correctly saves an invoice address', async () => {
      const addressDto = {
        uprn: mocks.address.uprn,
        postcode: mocks.address.postcode
      }
      const spy = sinon.spy(ContactDetail.prototype, 'save')
      await InvoiceAddress.saveSelectedAddress(request, addressDto)
      Code.expect(spy.callCount).to.equal(1)
      spy.restore()
    })

    lab.test('saveManualAddress() method correctly saves an invoice address', async () => {
      Address.getByUprn = () => undefined
      const addressDto = {
        postcode: mocks.address.postcode
      }
      const spy = sinon.spy(ContactDetail.prototype, 'save')
      await InvoiceAddress.saveManualAddress(request, addressDto)
      Code.expect(spy.callCount).to.equal(1)
      spy.restore()
    })
  })

  lab.experiment('Completeness:', () => {
    lab.test('isComplete() method correctly returns FALSE when the address details are not set', async () => {
      delete mocks.contactDetail.fullAddress
      const result = await InvoiceAddress.isComplete(context)
      Code.expect(result).to.equal(false)
    })

    lab.test('isComplete() method correctly returns TRUE when address details are set', async () => {
      const result = await InvoiceAddress.isComplete(context)
      Code.expect(result).to.equal(true)
    })
  })
})
