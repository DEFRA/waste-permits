'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Contact = require('../../../src/persistence/entities/contact.entity')
const ContactDetails = require('../../../src/models/taskList/contactDetails.task')

const COMPLETENESS_PARAMETER = 'defra_contactdetailsrequired_completed'

let fakeContact

let sandbox

lab.beforeEach(() => {
  fakeContact = {
    id: 'CONTACT_ID',
    firstName: 'FIRST_NAME'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(Contact, 'getByApplicationId').value(() => fakeContact)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Task List: ContactDetails Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(ContactDetails.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })

  lab.test('checkComplete() method correctly returns FALSE when the contact details are not set', async () => {
    delete fakeContact.firstName
    const result = await ContactDetails.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when contact details are set', async () => {
    const result = await ContactDetails.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
