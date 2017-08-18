'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const Contact = require('../../src/models/contact.model')
const DynamicsService = require('../../src/services/dynamics.service')

let dynamicsListStub

lab.beforeEach((done) => {
  // Stub methods
  dynamicsListStub = DynamicsService.prototype.list
  DynamicsService.prototype.list = (query) => {
    // Dynamics Contact objects
    return [{
      fullname: 'FULL NAME1'
    }, {
      fullname: 'FULL NAME2'
    }, {
      fullname: 'FULL NAME3'
    }]
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsService.prototype.list = dynamicsListStub

  done()
})

lab.experiment('Contact Model tests', () => {
  lab.test('convertObject() method converts a model object correctly', (done) => {
    const contact = new Contact({
      contactName: 'John Smith',
      contactTelephone: '01234567890',
      contactEmail: 'john.smith@email.com'
    })
    const convertedObject = contact.convertObject()

    Code.expect(convertedObject.firstname).to.equal('John')
    Code.expect(convertedObject.lastname).to.equal('Smith')

    done()
  })

  lab.test('list() method returns a list of Contact objects', (done) => {
    Contact.list().then((contactList) => {
      Code.expect(Array.isArray(contactList)).to.be.true()
      Code.expect(contactList.length).to.equal(3)
    })

    done()
  })
})
