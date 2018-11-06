const BaseModel = require('./base.model')
const Application = require('../persistence/entities/application.entity')
const AddressDetail = require('../persistence/entities/addressDetail.entity')
const Account = require('../persistence/entities/account.entity')
const Address = require('../persistence/entities/address.entity')
const Contact = require('../persistence/entities/contact.entity')

module.exports = class ContactDetail extends BaseModel {
  static get fields () {
    return {
      id: { entity: AddressDetail },
      applicationId: { entity: AddressDetail },
      customerId: { entity: AddressDetail },
      type: { entity: AddressDetail },
      jobTitle: { entity: AddressDetail },
      email: { entity: AddressDetail },
      dateOfBirth: { entity: AddressDetail },
      telephone: { entity: AddressDetail },
      addressId: { entity: AddressDetail },
      firstName: { entity: Contact },
      lastName: { entity: Contact },
      organisationType: { entity: Application },
      fullAddress: { entity: Address }
    }
  }

  static async _extractContactDetail (context, addressDetail) {
    const { applicationId } = context
    const { organisationType } = Application.getById(context, applicationId)
    const { id, jobTitle, firstName, lastName, email, telephone, type, dateOfBirth, addressId, customerId } = addressDetail
    let contactDetailData = { id, applicationId, firstName, lastName, jobTitle, email, telephone, type, dateOfBirth, organisationType, customerId }
    if (addressId) {
      const address = await Address.getById(context, addressId)
      if (address) {
        contactDetailData.addressId = addressId
        contactDetailData.fullAddress = address.fullAddress
      }
    }
    return new ContactDetail(contactDetailData)
  }

  static async get (context, { id, type }) {
    const { applicationId } = context
    if (!id && !type) {
      throw new Error('Expected either contact details id or type to be declared')
    }

    const addressDetail = id ? await AddressDetail.getById(context, id) : await AddressDetail.getBy(context, { applicationId, type })
    if (addressDetail) {
      return this._extractContactDetail(context, addressDetail)
    }
  }

  static async list (context, filter = {}) {
    filter.applicationId = context.applicationId
    const addressDetails = await AddressDetail.listBy(context, filter)
    return Promise.all(addressDetails.map((addressDetail) => this._extractContactDetail(context, addressDetail)))
  }

  async save (context) {
    const { applicationId, firstName, lastName, jobTitle, telephone, email, dateOfBirth, type, addressId, customerId } = this
    let { id } = this

    if (!id && !type) {
      throw new Error('Expected either contact details id or type to be declared')
    }

    const addressDetail = id ? await AddressDetail.getById(context, id) : new AddressDetail({ applicationId, type, customerId })

    // Todo: Updating contact entity will eventually be done within the CRM
    if (firstName || lastName) {
      const contact = (await Contact.getByFirstnameLastnameEmail(context, firstName, lastName, email)) || new Contact({ firstName, lastName, email })
      if (!contact.id) await contact.save(context)

      addressDetail.customerId = contact.id

      // Link the contact with the account if it isn't already
      const account = await Account.getByApplicationId(context, applicationId)
      if (account) {
        const linkedAccounts = await contact.listLinked(context, account)
        const link = linkedAccounts.find((linkedAccount) => linkedAccount.id === account.id)

        if (!link) {
          await contact.link(context, account)
        }
      }
    }

    if (jobTitle) addressDetail.jobTitle = jobTitle
    if (email) addressDetail.email = email
    if (telephone) addressDetail.telephone = telephone
    if (dateOfBirth) addressDetail.dateOfBirth = dateOfBirth
    if (firstName) addressDetail.firstName = firstName
    if (lastName) addressDetail.lastName = lastName
    if (addressId) addressDetail.addressId = addressId
    await addressDetail.save(context)

    this.id = addressDetail.id
    this.customerId = addressDetail.customerId
    return this.id
  }

  async delete (context) {
    const { id, applicationId } = this

    const addressDetail = await AddressDetail.getById(context, id)
    if (!addressDetail) {
      return
    }

    const contact = await Contact.getById(context, addressDetail.customerId)
    await addressDetail.delete(context)

    // If there is a contact, unlink the contact with the account if it is linked
    if (contact) {
      const account = await Account.getByApplicationId(context, applicationId)
      if (account) {
        const linkedAccounts = await contact.listLinked(context, account)
        const link = linkedAccounts.find((linkedAccount) => linkedAccount.id === account.id)

        if (link) {
          await contact.unLink(context, account)
        }
      }
    }
  }
}
