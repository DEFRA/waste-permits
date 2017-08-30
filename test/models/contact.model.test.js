'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Contact = require('../../src/models/contact.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let testContact
let dynamicsCreateItemStub
let dynamicsSearchStub
let dynamicsUpdateItemStub

lab.beforeEach((done) => {
  testContact = new Contact({
    firstname: 'John',
    lastname: 'Smith,',
    telephone1: '01234567890',
    emailaddress1: 'john.smith@email.com'
  })

  // Stub methods
  dynamicsSearchStub = DynamicsDalService.prototype.search
  DynamicsDalService.prototype.search = (query) => {
    // Dynamics Contact objects
    return [{
      fullname: 'FULL NAME1'
    }, {
      fullname: 'FULL NAME2'
    }, {
      fullname: 'FULL NAME3'
    }]
  }

  dynamicsCreateItemStub = DynamicsDalService.prototype.createItem
  DynamicsDalService.prototype.createItem = (query) => {
    return true
  }

  dynamicsUpdateItemStub = DynamicsDalService.prototype.updateItem
  DynamicsDalService.prototype.updateItem = (query) => {
    return true
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsDalService.prototype.createItem = dynamicsCreateItemStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.updateItem = dynamicsUpdateItemStub

  done()
})

lab.experiment('Contact Model tests:', () => {
  lab.test('list() method returns a list of Contact objects', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    Contact.list().then((contactList) => {
      Code.expect(Array.isArray(contactList)).to.be.true()
      Code.expect(contactList.length).to.equal(3)
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })

  lab.test('save() method saves a new Contact object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'createItem')
    testContact.save().then((response) => {
      Code.expect(response).to.be.true()
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })

  lab.test('save() method updates an existing Contact object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'updateItem')
    testContact.contactid = '123'
    testContact.save().then((response) => {
      Code.expect(response).to.be.true()
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })
})
