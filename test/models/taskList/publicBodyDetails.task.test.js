'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const CryptoService = require('../../../src/services/crypto.service')
const ContactDetail = require('../../../src/models/contactDetail.model')
const Account = require('../../../src/persistence/entities/account.entity')
const Contact = require('../../../src/persistence/entities/contact.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const PublicBodyDetails = require('../../../src/models/taskList/publicBodyDetails.task')

let request
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  request = mocks.request

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CryptoService, 'decrypt').value(async () => mocks.contactDetail.id)
  sandbox.stub(ContactDetail, 'get').value(async () => mocks.contactDetail)
  sandbox.stub(ContactDetail.prototype, 'save').value(async () => undefined)
  sandbox.stub(Account, 'getById').value(async () => mocks.account)
  sandbox.stub(Account.prototype, 'save').value(async () => undefined)
  sandbox.stub(Contact, 'getById').value(async () => mocks.contact)
  sandbox.stub(Address.prototype, 'save').value(async () => undefined)
  sandbox.stub(Address, 'getById').value(async () => mocks.address)
  sandbox.stub(Address, 'getByUprn').value(async () => mocks.address)
  sandbox.stub(Address, 'listByPostcode').value(async () => [mocks.address, mocks.address, mocks.address])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Model persistence methods:', () => {
  lab.test('getAddress() method correctly retrieves an Address', async () => {
    const address = await PublicBodyDetails.getAddress(request)
    Code.expect(address.uprn).to.be.equal(mocks.address.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves a public body address', async () => {
    const addressDto = {
      uprn: mocks.address.uprn,
      postcode: mocks.address.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PublicBodyDetails.saveSelectedAddress(request, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })

  lab.test('saveManualAddress() method correctly creates a public body address from a selected address that is already in Dynamics', async () => {
    const addressDto = {
      uprn: mocks.address.uprn,
      postcode: mocks.address.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PublicBodyDetails.saveManualAddress(request, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })
})
