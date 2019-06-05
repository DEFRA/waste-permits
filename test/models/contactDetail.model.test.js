'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')

const Application = require('../../src/persistence/entities/application.entity')
const Address = require('../../src/persistence/entities/address.entity')
const AddressDetail = require('../../src/persistence/entities/addressDetail.entity')
const Account = require('../../src/persistence/entities/account.entity')
const Contact = require('../../src/persistence/entities/contact.entity')
const ContactDetail = require('../../src/models/contactDetail.model')
const CharityDetail = require('../../src/models/charityDetail.model')

let mocks
let context

lab.experiment('ContactDetail test:', () => {
  let sandbox

  lab.beforeEach(() => {
    mocks = new Mocks()
    context = mocks.context

    // Create a sinon sandbox to stub methods
    sandbox = sinon.createSandbox()

    // Stub methods
    sandbox.stub(Application, 'getById').value(() => mocks.application)
    sandbox.stub(Address, 'getById').value(() => mocks.address)
    sandbox.stub(AddressDetail, 'getById').value(() => mocks.addressDetail)
    sandbox.stub(AddressDetail, 'getBy').value(() => mocks.addressDetail)
    sandbox.stub(AddressDetail, 'listBy').value(() => [mocks.addressDetail])
    sandbox.stub(AddressDetail.prototype, 'save').value(() => undefined)
    sandbox.stub(AddressDetail.prototype, 'delete').value(() => undefined)
    sandbox.stub(Account, 'getByApplicationId').value(() => mocks.account)
    sandbox.stub(Contact, 'getById').value(() => mocks.contact)
    sandbox.stub(Contact, 'getByFirstnameLastnameEmail').value(() => mocks.contact)
    sandbox.stub(Contact.prototype, 'save').value(() => undefined)
    sandbox.stub(Contact.prototype, 'listLinked').value(() => [mocks.account])
    sandbox.stub(Contact.prototype, 'link').value(() => undefined)
    sandbox.stub(Contact.prototype, 'unLink').value(() => undefined)
    sandbox.stub(CharityDetail, 'get').value(() => mocks.charityDetail)
  })

  lab.afterEach(() => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('via id', async () => {
      const contactDetail = await ContactDetail.get(context, { id: mocks.addressDetail.id })
      Code.expect(contactDetail.id).to.equal(mocks.addressDetail.id)
    })

    lab.test('via type', async () => {
      const contactDetail = await ContactDetail.get(context, { type: mocks.addressDetail.type })
      Code.expect(contactDetail.id).to.equal(mocks.addressDetail.id)
    })
  })

  lab.test('list', async () => {
    const contactDetails = await ContactDetail.list(context, { type: mocks.addressDetail.type })
    Code.expect(contactDetails.length).to.equal(1)
    const contactDetail = contactDetails.pop()
    Code.expect(contactDetail.id).to.equal(mocks.addressDetail.id)
  })

  lab.experiment('save', () => {
    lab.test('via create', async () => {
      mocks.contactDetail.id = undefined
      const contactDetail = new ContactDetail(mocks.contactDetail)
      await contactDetail.save(context)
      Code.expect(contactDetail).to.equal(mocks.contactDetail)
    })

    lab.test('via update', async () => {
      const contactDetail = new ContactDetail(mocks.contactDetail)
      const id = await contactDetail.save(context)
      Code.expect(id).to.equal(mocks.contactDetail.id)
      Code.expect(contactDetail).to.equal(mocks.contactDetail)
    })
  })

  lab.test('delete', async () => {
    const contactDetail = new ContactDetail(mocks.contactDetail)
    await contactDetail.delete(context)
  })
})
