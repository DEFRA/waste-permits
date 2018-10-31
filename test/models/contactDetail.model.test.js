'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const Application = require('../../src/persistence/entities/application.entity')
const Address = require('../../src/persistence/entities/address.entity')
const AddressDetail = require('../../src/persistence/entities/addressDetail.entity')
const Account = require('../../src/persistence/entities/account.entity')
const Contact = require('../../src/persistence/entities/contact.entity')
const ContactDetail = require('../../src/models/contactDetail.model')

const context = { authToken: 'AUTH_TOKEN' }

let fakeApplication
let fakeAccount
let fakeAddress
let fakeAddressDetail
let fakeAddressDetailId
let fakeContact
let fakeContactDetail

lab.experiment('ContactDetail test:', () => {
  let sandbox

  lab.beforeEach(() => {
    fakeAddressDetailId = 'ADDRESS_DETAIL_ID'

    fakeApplication = {
      organisationType: 'ORGANISATION_TYPE'
    }

    fakeAccount = {
      id: 'ACCOUNT_ID'
    }

    fakeAddress = {
      uprn: 'UPRN_123456',
      fromAddressLookup: true,
      buildingNameOrNumber: '123',
      addressLine1: 'THE STREET',
      addressLine2: 'THE DISTRICT',
      townOrCity: 'TEST TOWN',
      postcode: 'BS1 5AH'
    }

    fakeContact = {
      id: 'CONTACT_ID',
      firstName: 'FIRSTNAME',
      lastName: 'LASTNAME'
    }

    fakeAddressDetail = {
      id: fakeAddressDetailId,
      customerId: fakeContact.id,
      firstName: fakeContact.firstName,
      lastName: fakeContact.lastName,
      type: 'ADDRESS_DETAIL_TYPE',
      email: 'EMAIL',
      telephone: 'TELEPHONE',
      jobTitle: 'JOB_TITLE'
    }

    fakeContactDetail = {
      id: fakeAddressDetailId,
      customerId: fakeContact.id,
      type: fakeAddressDetail.type,
      firstName: fakeAddressDetail.firstName,
      lastName: fakeAddressDetail.lastName,
      email: fakeAddressDetail.email,
      telephone: fakeAddressDetail.telephone,
      jobTitle: fakeAddressDetail.jobTitle
    }

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
    sandbox.stub(Address, 'getById').value(() => new AddressDetail(fakeAddress))
    sandbox.stub(AddressDetail, 'getById').value(() => new AddressDetail(fakeAddressDetail))
    sandbox.stub(AddressDetail, 'getBy').value(() => new AddressDetail(fakeAddressDetail))
    sandbox.stub(AddressDetail, 'listBy').value(() => [new AddressDetail(fakeAddressDetail)])
    sandbox.stub(AddressDetail.prototype, 'save').value(() => fakeAddressDetailId)
    sandbox.stub(AddressDetail.prototype, 'delete').value(() => undefined)
    sandbox.stub(Account, 'getByApplicationId').value(() => new Account(fakeAccount))
    sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
    sandbox.stub(Contact, 'getByFirstnameLastnameEmail').value(() => new Contact(fakeContact))
    sandbox.stub(Contact.prototype, 'save').value(() => fakeContact.id)
    sandbox.stub(Contact.prototype, 'listLinked').value(() => [new Account(fakeAccount)])
    sandbox.stub(Contact.prototype, 'link').value(() => undefined)
    sandbox.stub(Contact.prototype, 'unLink').value(() => undefined)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('via id', async () => {
      const contactDetail = await ContactDetail.get(context, { id: fakeAddressDetail.id })
      Code.expect(contactDetail.id).to.equal(fakeAddressDetail.id)
    })

    lab.test('via type', async () => {
      const contactDetail = await ContactDetail.get(context, { type: fakeAddressDetail.type })
      Code.expect(contactDetail.id).to.equal(fakeAddressDetail.id)
    })
  })

  lab.test('list', async () => {
    const contactDetails = await ContactDetail.list(context, { type: fakeAddressDetail.type })
    Code.expect(contactDetails.length).to.equal(1)
    const contactDetail = contactDetails.pop()
    Code.expect(contactDetail.id).to.equal(fakeAddressDetail.id)
  })

  lab.experiment('save', () => {
    lab.test('via create', async () => {
      fakeContactDetail.id = undefined
      const contactDetail = new ContactDetail(fakeContactDetail)
      await contactDetail.save(context)
      Code.expect(contactDetail).to.equal(fakeContactDetail)
    })

    lab.test('via update', async () => {
      const contactDetail = new ContactDetail(fakeContactDetail)
      const id = await contactDetail.save(context)
      Code.expect(id).to.equal(fakeContactDetail.id)
      Code.expect(contactDetail).to.equal(fakeContactDetail)
    })
  })

  lab.test('delete', async () => {
    const contactDetail = new ContactDetail(fakeContactDetail)
    await contactDetail.delete(context)
  })
})
