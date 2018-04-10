'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const DynamicsDalService = require('../../../src/services/dynamicsDal.service')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Contact = require('../../../src/models/contact.model')
const ContactDetails = require('../../../src/models/taskList/contactDetails.model')

let sandbox

const fakeApplication = {
  id: 'ca6b60f0-c1bf-e711-8111-5065f38adb81'
}

const fakeContact = {
  id: 'CONTACT_ID',
  firstName: 'FIRST_NAME',
  lastName: 'LAST_NAME',
  email: 'EMAIL'
}

const authToken = 'THE_AUTH_TOKEN'
const applicationId = fakeApplication.id

let testContact

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(ApplicationLine, 'getById').value(() => fakeApplication)
  sandbox.stub(Contact, 'getByApplicationId').value(() => new Contact(testContact))
  sandbox.stub(Contact.prototype, 'save').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})
const testCompleteness = async (contact, expectedResult) => {
  testContact = Object.assign({}, fakeContact, contact)
  const result = await ContactDetails.isComplete(authToken, applicationId)
  Code.expect(result).to.equal(expectedResult)
}

lab.experiment('Task List: Contact Details Model tests:', () => {
  lab.test('updateCompleteness() method updates the task list item completeness', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    await ContactDetails.updateCompleteness(authToken, applicationId)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('isComplete() method correctly returns TRUE when the task list item is complete', async () => {
    await testCompleteness({
      firstName: fakeContact.firstName
    }, true)
  })

  lab.test('isComplete() method correctly returns FALSE when the task list item is not complete', async () => {
    await testCompleteness({
      firstName: undefined
    }, false)

    await testCompleteness({
      firstName: ''
    }, false)
  })
})
