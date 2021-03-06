'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')

const Contact = require('../../../src/persistence/entities/contact.entity')
const dynamicsDal = require('../../../src/services/dynamicsDal.service')

let testContact
let sandbox
const context = { }

lab.beforeEach(() => {
  testContact = new Contact({
    firstName: 'John',
    lastName: 'Smith,',
    telephone: '01234567890',
    email: 'john.smith@email.com',
    dob: {
      day: 1,
      month: 2,
      year: 1970
    }
  })

  const searchResult = {
    '@odata.context': 'THE_ODATA_ENDPOINT_AND_QUERY',
    value: [
      {
        '@odata.etag': 'W/"1155486"',
        contactid: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
        firstname: 'Marlon',
        lastname: 'Herzog',
        telephone1: '055 8767 0835',
        emailaddress1: 'Amparo.Abbott49@example.com',
        defra_dateofbirthdaycompanieshouse: 1,
        defra_dobmonthcompanieshouse: 2,
        defra_dobyearcompanieshouse_text: '1970'
      },
      {
        '@odata.etag': 'W/"1155506"',
        contactid: '8e8e4354-4f24-e711-80fd-5065f38a1b01',
        firstname: 'Kelvin',
        lastname: 'Rice',
        telephone1: '055 8301 2280',
        emailaddress1: 'Mike9@example.com',
        defra_dateofbirthdaycompanieshouse: 3,
        defra_dobmonthcompanieshouse: 4,
        defra_dobyearcompanieshouse_text: '1970'
      },
      {
        '@odata.etag': 'W/"1273787"',
        contactid: '9d8e4354-4f24-e711-80fd-5065f38a1b01',
        firstname: 'Maximo',
        lastname: 'Wisoky',
        telephone1: '01424 733336',
        emailaddress1: 'Danielle.Howell@example.com',
        defra_dateofbirthdaycompanieshouse: 5,
        defra_dobmonthcompanieshouse: 6,
        defra_dobyearcompanieshouse_text: '1970'
      }
    ]
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(dynamicsDal, 'create').value(() => '7a8e4354-4f24-e711-80fd-5065f38a1b01')
  sandbox.stub(dynamicsDal, 'update').value((dataObject) => dataObject.id)
  sandbox.stub(dynamicsDal, 'search').value(() => searchResult)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Contact Entity tests:', () => {
  lab.test('getById() method returns a single Contact object', async () => {
    const dynamicsData = {
      '@odata.etag': 'W/"1155486"',
      contactid: '7a8e4354-4f24-e711-80fd-5065f38a1b01',
      firstname: 'Marlon',
      lastname: 'Herzog',
      telephone1: '055 8767 0835',
      emailaddress1: 'Amparo.Abbott49@example.com',
      defra_dateofbirthdaycompanieshouse: 1,
      defra_dobmonthcompanieshouse: 2,
      defra_dobyearcompanieshouse_text: '1970'
    }
    dynamicsDal.search = () => {
      // Dynamics Contact objects
      return dynamicsData
    }

    const spy = sinon.spy(dynamicsDal, 'search')
    const contact = await Contact.getById(context, dynamicsData.contactid)
    Code.expect(contact).to.equal({
      id: dynamicsData.contactid,
      firstName: dynamicsData.firstname,
      lastName: dynamicsData.lastname,
      email: dynamicsData.emailaddress1,
      dob: {
        month: dynamicsData.defra_dobmonthcompanieshouse,
        year: dynamicsData.defra_dobyearcompanieshouse_text
      }
    })
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('list() method returns a list of Contact objects', async () => {
    const spy = sinon.spy(dynamicsDal, 'search')
    const contactList = await Contact.list(context)
    Code.expect(Array.isArray(contactList)).to.be.true()
    Code.expect(contactList.length).to.equal(3)
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('save() method saves a new Contact object', async () => {
    const spy = sinon.spy(dynamicsDal, 'create')
    await testContact.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testContact.id).to.equal('7a8e4354-4f24-e711-80fd-5065f38a1b01')
  })

  lab.test('save() method updates an existing Contact object', async () => {
    const spy = sinon.spy(dynamicsDal, 'update')
    testContact.id = '123'
    await testContact.save(context)
    Code.expect(spy.callCount).to.equal(1)
    Code.expect(testContact.id).to.equal('123')
  })
})
