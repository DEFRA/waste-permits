'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Contact = require('../../src/models/contact.model')
const DynamicsService = require('../../src/services/dynamics.service')

let testContact
let dynamicsCreateItemStub
let dynamicsListItemsStub
let dynamicsUpdateItemStub

lab.beforeEach((done) => {
  testContact = new Contact({
    contactName: 'John Smith',
    contactTelephone: '01234567890',
    contactEmail: 'john.smith@email.com'
  })

  // Stub methods
  dynamicsListItemsStub = DynamicsService.prototype.listItems
  DynamicsService.prototype.listItems = (query) => {
    // Dynamics Contact objects
    return [{
      fullname: 'FULL NAME1'
    }, {
      fullname: 'FULL NAME2'
    }, {
      fullname: 'FULL NAME3'
    }]
  }

  dynamicsCreateItemStub = DynamicsService.prototype.createItem
  DynamicsService.prototype.createItem = (query) => {
    return true
  }

  dynamicsUpdateItemStub = DynamicsService.prototype.updateItem
  DynamicsService.prototype.updateItem = (query) => {
    return true
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsService.prototype.createItem = dynamicsCreateItemStub
  DynamicsService.prototype.listItems = dynamicsListItemsStub
  DynamicsService.prototype.updateItem = dynamicsUpdateItemStub

  done()
})

lab.experiment('Contact Model tests:', () => {
  lab.test('isValid() method validates a Contact object correctly', (done) => {
    Code.expect(testContact.isValid()).to.be.true()

    testContact = new Contact({
      contactName: '',
      contactTelephone: '01234567890',
      contactEmail: 'john.smith@email.com'
    })
    Code.expect(testContact.isValid()).to.be.false()

    testContact = new Contact({
      contactName: 'John Smith',
      contactTelephone: '',
      contactEmail: 'john.smith@email.com'
    })
    Code.expect(testContact.isValid()).to.be.false()

    testContact = new Contact({
      contactName: 'John Smith',
      contactTelephone: '01234567890',
      contactEmail: ''
    })
    Code.expect(testContact.isValid()).to.be.false()

    done()
  })

  lab.test('convertObject() method converts a Contact object correctly', (done) => {
    const convertedObject = testContact.convertObject()

    Code.expect(convertedObject.firstname).to.equal('John')
    Code.expect(convertedObject.lastname).to.equal('Smith')

    done()
  })

  lab.test('list() method returns a list of Contact objects', (done) => {
    const spy = sinon.spy(DynamicsService.prototype, 'listItems')
    Contact.list().then((contactList) => {
      Code.expect(Array.isArray(contactList)).to.be.true()
      Code.expect(contactList.length).to.equal(3)
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })

  lab.test('save() method saves a new Contact object', (done) => {
    const spy = sinon.spy(DynamicsService.prototype, 'createItem')
    testContact.save().then((response) => {
      Code.expect(response).to.be.true()
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })

  lab.test('save() method updates an existing Contact object', (done) => {
    const spy = sinon.spy(DynamicsService.prototype, 'updateItem')
    testContact.id = '123'
    testContact.save().then((response) => {
      Code.expect(response).to.be.true()
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })
})
