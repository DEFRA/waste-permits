'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const CryptoService = require('../../../src/services/crypto.service')
const Application = require('../../../src/persistence/entities/application.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const Account = require('../../../src/persistence/entities/account.entity')
const Contact = require('../../../src/persistence/entities/contact.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const PartnerDetails = require('../../../src/models/taskList/partnerDetails.task')

let sandbox
let request
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  request = {
    app: {
      data: {
        authToken: 'AUTH_TOKEN'
      }
    },
    params: {
      partnerId: mocks.addressDetail.id
    }
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CryptoService, 'decrypt').value(() => mocks.contactDetail.id)
  sandbox.stub(ContactDetail, 'get').value(() => mocks.contactDetail)
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(ApplicationLine, 'getById').value(() => mocks.applicationLine)
  sandbox.stub(Account, 'getById').value(() => mocks.account)
  sandbox.stub(Account.prototype, 'save').value(() => undefined)
  sandbox.stub(Contact, 'getById').value(() => mocks.contact)
  sandbox.stub(Address.prototype, 'save').value(() => undefined)
  sandbox.stub(Address, 'getById').value(() => mocks.address)
  sandbox.stub(Address, 'getByUprn').value(() => mocks.address)
  sandbox.stub(Address, 'listByPostcode').value(() => [mocks.address, mocks.address, mocks.address])
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Model persistence methods:', () => {
  lab.test('getAddress() method correctly retrieves an Address', async () => {
    const address = await PartnerDetails.getAddress(request, mocks.application.id)
    Code.expect(address.uprn).to.be.equal(mocks.address.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves a partner address', async () => {
    const { uprn, postcode } = mocks.address
    const addressDto = { uprn, postcode }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PartnerDetails.saveSelectedAddress(request, mocks.application.id, mocks.applicationLine.id, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })

  lab.test('saveManualAddress() method correctly creates a partner address from a selected address that is already in Dynamics', async () => {
    const { uprn, postcode } = mocks.address
    const addressDto = { uprn, postcode }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PartnerDetails.saveManualAddress(request, mocks.application.id, mocks.applicationLine.id, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })
})
