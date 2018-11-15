'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const Application = require('../../../src/persistence/entities/application.entity')
const ApplicationLine = require('../../../src/persistence/entities/applicationLine.entity')
const Account = require('../../../src/persistence/entities/account.entity')
const Address = require('../../../src/persistence/entities/address.entity')
const ContactDetail = require('../../../src/models/contactDetail.model')
const PermitHolderDetails = require('../../../src/models/taskList/permitHolderDetails.task')

const INDIVIDUAL = 910400000

let request
let applicationId
let applicationLineId

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  applicationId = 'APPLICATION_ID'
  applicationLineId = 'APPLICATION_LINE_ID'

  request = { app: { data: { authToken: 'AUTH_TOKEN' } } }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(ContactDetail.prototype, 'save').value(() => mocks.address.id)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(ApplicationLine, 'getById').value(() => mocks.applicationLine)
  sandbox.stub(Account, 'getById').value(() => mocks.account)
  sandbox.stub(Account.prototype, 'save').value(() => undefined)
  sandbox.stub(ContactDetail, 'get').value(() => new ContactDetail(mocks.contactDetail))
  sandbox.stub(ContactDetail.prototype, 'save').value(() => undefined)
  sandbox.stub(Address, 'getById').value(() => mocks.address)
  sandbox.stub(Address, 'getByUprn').value(() => mocks.address)
  sandbox.stub(Address, 'listByPostcode').value(() => [mocks.address, mocks.address, mocks.address])
  sandbox.stub(Address.prototype, 'save').value(() => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

const testCompleteness = async (expectedResult) => {
  const result = await PermitHolderDetails.checkComplete()
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Model persistence methods:', () => {
  lab.test('getAddress() method correctly retrieves an Address', async () => {
    const address = await PermitHolderDetails.getAddress(request, applicationId)
    Code.expect(address.uprn).to.be.equal(mocks.address.uprn)
  })

  lab.test('saveSelectedAddress() method correctly saves a permit holder address', async () => {
    const addressDto = {
      uprn: mocks.address.uprn,
      postcode: mocks.address.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PermitHolderDetails.saveSelectedAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })

  lab.test('saveManualAddress() method correctly creates a permit holder address from a selected address', async () => {
    const addressDto = {
      uprn: mocks.address.uprn,
      postcode: mocks.address.postcode
    }
    const spy = sinon.spy(ContactDetail.prototype, 'save')
    await PermitHolderDetails.saveManualAddress(request, applicationId, applicationLineId, addressDto)
    Code.expect(spy.callCount).to.equal(1)
    spy.restore()
  })
})

lab.experiment('Task List: Permit Holder Details Model tests:', () => {
  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for a company', async () => {
    delete mocks.application.applicantType
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete for an individual', async () => {
    testCompleteness(true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for a company', async () => {
    delete mocks.application.applicantType
    delete mocks.account.accountName
    testCompleteness(false)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete for an individual', async () => {
    mocks.application.applicantType = INDIVIDUAL
    delete mocks.contactDetail.firstName
    testCompleteness(false)
  })
})
