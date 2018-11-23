'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')

const ContactDetail = require('../../../src/models/contactDetail.model')
const ContactDetails = require('../../../src/models/taskList/contactDetails.task')

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(ContactDetail, 'get').callsFake(async () => mocks.contactDetail)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: ContactDetails Model tests:', () => {
  lab.test('isComplete() method correctly returns FALSE when the contact details are not set', async () => {
    delete mocks.contactDetail.firstName
    const result = await ContactDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(false)
  })

  lab.test('isComplete() method correctly returns TRUE when contact details are set', async () => {
    const result = await ContactDetails.isComplete(mocks.context)
    Code.expect(result).to.equal(true)
  })
})
