'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ContactDetail = require('../../../src/models/contactDetail.model')
const ContactDetails = require('../../../src/models/taskList/contactDetails.task')

const COMPLETENESS_PARAMETER = 'defra_contactdetailsrequired_completed'

let fakeContactDetail

let sandbox

lab.beforeEach(() => {
  fakeContactDetail = {
    firstName: 'FIRST_NAME',
    lastName: 'LAST_NAME',
    telephone: 'TELEPHONE',
    email: 'EMAIL'
  }

  // Create a sinon sandbox
  sandbox = sinon.createSandbox()

  // Stub the asynchronous model methods
  sandbox.stub(ContactDetail, 'get').value(() => fakeContactDetail)
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
    delete fakeContactDetail.firstName
    const result = await ContactDetails.checkComplete()
    Code.expect(result).to.equal(false)
  })

  lab.test('checkComplete() method correctly returns TRUE when contact details are set', async () => {
    const result = await ContactDetails.checkComplete()
    Code.expect(result).to.equal(true)
  })
})
