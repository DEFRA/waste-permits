'use strict'

const config = require('../../src/config/config')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Contact = require('../../src/models/contact.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let testContact
let dynamicsCreateStub
let dynamicsSearchStub
let dynamicsUpdateStub

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
    return {
      '@odata.context': 'THE_DAL_QUERY',
      value: [
        { '@odata.etag': 'W/"1155486"',
          contactid: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
          firstname: 'Marlon',
          lastname: 'Herzog',
          telephone1: '055 8767 0835',
          emailaddress1: 'Amparo.Abbott49@example.com' },
        { '@odata.etag': 'W/"1155506"',
          contactid: '8e8e4354-4f24-e711-80fd-5065f38a1b01',
          firstname: 'Kelvin',
          lastname: 'Rice',
          telephone1: '055 8301 2280',
          emailaddress1: 'Mike9@example.com' },
        { '@odata.etag': 'W/"1273787"',
          contactid: '9d8e4354-4f24-e711-80fd-5065f38a1b01',
          firstname: 'Maximo',
          lastname: 'Wisoky',
          telephone1: '01424 733336',
          emailaddress1: 'Danielle.Howell@example.com'
        }
      ]
    }
  }

  dynamicsCreateStub = DynamicsDalService.prototype.create
  DynamicsDalService.prototype.create = (dataObject, query) => {
    return '7a8e4354-4f24-e711-80fd-5065f38a1b01'
  }

  dynamicsUpdateStub = DynamicsDalService.prototype.update
  DynamicsDalService.prototype.update = (dataObject, query) => {
    return dataObject.id
  }

  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  DynamicsDalService.prototype.create = dynamicsCreateStub
  DynamicsDalService.prototype.search = dynamicsSearchStub
  DynamicsDalService.prototype.update = dynamicsUpdateStub

  done()
})

lab.experiment('Contact Model tests:', () => {
  lab.test('getById() method returns a single Contact object', (done) => {
    DynamicsDalService.prototype.search = (query) => {
      // Dynamics Contact objects
      return {
        '@odata.etag': 'W/"1155486"',
        contactid: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
        firstname: 'Marlon',
        lastname: 'Herzog',
        telephone1: '055 8767 0835',
        emailaddress1: 'Amparo.Abbott49@example.com'
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    Contact.getById().then((contact) => {
      Code.expect(spy.callCount).to.equal(1)
    })

    done()
  })

  lab.test('list() method returns a list of Contact objects', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    Contact.list().then((contactList) => {
      Code.expect(Array.isArray(contactList.results)).to.be.true()
      Code.expect(contactList.results.length).to.equal(3)
      Code.expect(contactList.count).to.equal(3)
      Code.expect(spy.callCount).to.equal(1)

      done()
    })
  })

  lab.test('save() method saves a new Contact object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'create')
    testContact.save().then(() => {
      Code.expect(spy.callCount).to.equal(1)
      Code.expect(testContact.id).to.be.equal('7a8e4354-4f24-e711-80fd-5065f38a1b01')

      done()
    })
  })

  lab.test('save() method updates an existing Contact object', (done) => {
    const spy = sinon.spy(DynamicsDalService.prototype, 'update')
    testContact.id = '123'
    testContact.save().then(() => {
      Code.expect(spy.callCount).to.equal(1)
      Code.expect(testContact.id).to.be.equal('123')

      done()
    })
  })
})
