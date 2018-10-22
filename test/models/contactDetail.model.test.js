'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const AddressDetail = require('../../src/persistence/entities/addressDetail.entity')
const Account = require('../../src/persistence/entities/account.entity')
const Contact = require('../../src/persistence/entities/contact.entity')
const ContactDetail = require('../../src/models/contactDetail.model')

const context = { authToken: 'AUTH_TOKEN' }

let fakeAccount
let fakeAddressDetail
let fakeAddressDetailId
let fakeContact
let fakeContactDetail

lab.experiment('ContactDetail test:', () => {
  let sandbox

  lab.beforeEach(() => {
    fakeAddressDetailId = 'ADDRESS_DETAIL_ID'

    fakeAccount = {
      id: 'ACCOUNT_ID'
    }

    fakeContact = {
      id: 'CONTACT_ID',
      firstName: 'FIRSTNAME',
      lastName: 'LASTNAME'
    }

    fakeAddressDetail = {
      id: fakeAddressDetailId,
      customerId: fakeContact.id,
      type: 'ADDRESS_DETAIL_TYPE',
      email: 'EMAIL',
      telephone: 'TELEPHONE',
      jobTitle: 'JOB_TITLE'
    }

    fakeContactDetail = {
      id: fakeAddressDetailId,
      type: fakeAddressDetail.type,
      email: fakeAddressDetail.email,
      telephone: fakeAddressDetail.telephone,
      jobTitle: fakeAddressDetail.jobTitle
    }

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(AddressDetail, 'getById').value(() => new AddressDetail(fakeAddressDetail))
    sandbox.stub(AddressDetail, 'getBy').value(() => new AddressDetail(fakeAddressDetail))
    sandbox.stub(AddressDetail.prototype, 'save').value(() => fakeAddressDetailId)
    sandbox.stub(AddressDetail.prototype, 'delete').value(() => undefined)
    sandbox.stub(Account, 'getByApplicationId').value(() => new Account(fakeAccount))
    sandbox.stub(Contact, 'getById').value(() => new Contact(fakeContact))
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

  lab.experiment('save', () => {
    lab.test('via create', async () => {
      delete fakeContactDetail.id
      const contactDetail = new ContactDetail(fakeContactDetail)
      const id = await contactDetail.save(context)
      Code.expect(id).to.equal(fakeAddressDetailId)
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
