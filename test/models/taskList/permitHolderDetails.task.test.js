'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Account = require('../../../src/persistence/entities/account.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const CharityDetail = require('../../../src/models/charityDetail.model')
const ContactDetail = require('../../../src/models/contactDetail.model')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.task')

const {
  INDIVIDUAL,
  LIMITED_COMPANY
} = require('../../../src/dynamics').PERMIT_HOLDER_TYPES

let request
let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  request = mocks.request

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(ContactDetail.prototype, 'save').value(async () => mocks.address.id)
  sandbox.stub(Account, 'getById').value(async () => mocks.account)
  sandbox.stub(Account.prototype, 'save').value(async () => undefined)
  sandbox.stub(ContactDetail, 'get').value(async () => mocks.contactDetail)
  sandbox.stub(ContactDetail.prototype, 'save').value(async () => undefined)
  sandbox.stub(Address, 'getById').value(async () => mocks.address)
  sandbox.stub(Address, 'getByUprn').value(async () => mocks.address)
  sandbox.stub(Address, 'listByPostcode').value(() => [mocks.address, mocks.address, mocks.address])
  sandbox.stub(Address.prototype, 'save').value(async () => undefined)
  sandbox.stub(CharityDetail, 'get').value(async () => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Model persistence methods:', () => {
  lab.test('getAddress() method correctly retrieves an Address', async () => {
    const address = await PermitHolderDetails.getAddress(request)
    Code.expect(address.uprn).to.be.equal(mocks.address.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves a permit holder address', async () => {
    const addressDto = {
      uprn: mocks.address.uprn,
      postcode: mocks.address.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PermitHolderDetails.saveSelectedAddress(request, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })

  lab.test('saveManualAddress() method correctly creates a permit holder address from a selected address', async () => {
    const addressDto = {
      uprn: mocks.address.uprn,
      postcode: mocks.address.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PermitHolderDetails.saveManualAddress(request, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })
})

lab.experiment('Task List: Permit Holder Details Model tests:', () => {
  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for a company', async () => {
    mocks.context.permitHolderType = LIMITED_COMPANY
    const result = await PermitHolderDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for an individual', async () => {
    mocks.context.permitHolderType = INDIVIDUAL
    const result = await PermitHolderDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for a company', async () => {
    mocks.context.permitHolderType = LIMITED_COMPANY
    delete mocks.account.accountName
    const result = await PermitHolderDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for an individual', async () => {
    mocks.context.permitHolderType = INDIVIDUAL
    delete mocks.contactDetail.firstName
    const result = await PermitHolderDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns FALSE when relevant offences have not been completed', async () => {
    mocks.context.permitHolderType = LIMITED_COMPANY
    delete mocks.application.relevantOffences
    const result = await PermitHolderDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns FALSE when bankruptcy details have not been completed', async () => {
    mocks.context.permitHolderType = LIMITED_COMPANY
    delete mocks.application.bankruptcy
    const result = await PermitHolderDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })
})
