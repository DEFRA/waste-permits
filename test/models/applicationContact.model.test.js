'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const ApplicationContact = require('../../src/models/applicationContact.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let fakeApplicationContact
let dynamicsCreateStub
let dynamicsUpdateStub
let dynamicsSearchStub

const context = {authToken: 'AUTH_TOKEN'}
const applicationContactId = 'APPLICATION_CONTACT_ID'
const applicationId = 'APPLICATION_ID'
const contactId = 'CONTACT_ID'

lab.beforeEach(() => {
  // testApplication = new ApplicationContact()
  fakeApplicationContact = new ApplicationContact({
    directorDob: '1970-12-31',
    applicationId: 'APPLICATION_ID',
    contactId: 'CONTACT_ID'
  })

  // Stub methods

  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = () => {
    // Dynamics ApplicationContact objects
    return {
      '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
      value: [{
        defra_applicationcontactid: applicationContactId,
        _defra_applicationid_value: applicationId,
        _defra_contactid_value: contactId,
        defra_dobcompanieshouse: '1970-12-31'
      }]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = () => applicationContactId

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = () => applicationContactId
})

lab.afterEach(() => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub
})

lab.experiment('ApplicationContact Model tests:', () => {
  lab.test('get() method correctly retrieves an ApplicationContact object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const applicationContact = await ApplicationContact.get(context, applicationId, contactId)
    Code.expect(spy.callCount).to.equal(1)

    Code.expect(applicationContact.id).to.equal(applicationContactId)
    Code.expect(applicationContact.directorDob).to.equal(fakeApplicationContact.directorDob)
    Code.expect(applicationContact.applicationId).to.equal(fakeApplicationContact.applicationId)
    Code.expect(applicationContact.contactId).to.equal(fakeApplicationContact.contactId)
  })

  lab.test('save() method saves a new ApplicationContact object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    await fakeApplicationContact.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(fakeApplicationContact.id).to.equal(applicationContactId)
  })

  lab.test('save() method saves an existing ApplicationContact object', async () => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    fakeApplicationContact.id = applicationContactId
    await fakeApplicationContact.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(fakeApplicationContact.id).to.equal(applicationContactId)
  })
})
