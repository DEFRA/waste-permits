'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const InvoiceAddress = require('../../../src/models/taskList/invoiceAddress.task')

let request
let applicationId
let applicationLineId
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  applicationId = mocks.application.id
  applicationLineId = mocks.applicationLine.id

  request = { app: { data: { authToken: 'AUTH_TOKEN' } } }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(DynamicsDalService.prototype, 'create').value(() => mocks.address.id)
  sandbox.stub(DynamicsDalService.prototype, 'update').value(() => mocks.address.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => mocks.applicationLine)
  sandbox.stub(ContactDetail, 'get').value(() => mocks.contactDetail)
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(Address.prototype, 'save').value(() => undefined)
  sandbox.stub(Address, 'getById').value(() => mocks.address)
  sandbox.stub(Address, 'getByUprn').value(() => mocks.address)
  sandbox.stub(Address, 'listByPostcode').value(() => [mocks.address, mocks.address, mocks.address])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: Invoice Address Model tests:', () => {
  lab.experiment('Model persistence methods:', () => {
    lab.test('getAddress() method correctly retrieves an Address', async () => {
      const address = await InvoiceAddress.getAddress(request, applicationId)
      Code.expect(address.uprn).to.be.equal(mocks.address.uprn)
    })

    lab.test('saveSelectedAddress() method correctly saves an invoice address', async () => {
      const addressDto = {
        uprn: mocks.address.uprn,
        postcode: mocks.address.postcode
      }
      const spy = sinon.spy(ContactDetail.prototype, 'save')
      await InvoiceAddress.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
      spy.restore()
    })

    lab.test('saveManualAddress() method correctly saves an invoice address', async () => {
      Address.getByUprn = () => undefined
      const addressDto = {
        postcode: mocks.address.postcode
      }
      const spy = sinon.spy(ContactDetail.prototype, 'save')
      await InvoiceAddress.saveManualAddress(request, applicationId, applicationLineId, addressDto)
      Code.expect(spy.callCount).to.equal(1)
      spy.restore()
    })
  })

  lab.experiment('Completeness:', () => {
    lab.test('checkComplete() method correctly returns FALSE when the address details are not set', async () => {
      delete mocks.contactDetail.addressId
      const result = await InvoiceAddress.checkComplete()
      Code.expect(result).to.equal(false)
    })

    lab.test('checkComplete() method correctly returns TRUE when address details are set', async () => {
      const result = await InvoiceAddress.checkComplete()
      Code.expect(result).to.equal(true)
    })
  })
})
