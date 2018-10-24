const AddressDetail = require('../persistence/entities/addressDetail.entity')
const Account = require('../persistence/entities/account.entity')
const Contact = require('../persistence/entities/contact.entity')

module.exports = class ContactDetail {
  static get fields () {
    return {
      id: { entity: AddressDetail },
      applicationId: { entity: AddressDetail },
      type: { entity: AddressDetail },
      jobTitle: { entity: AddressDetail },
      email: { entity: AddressDetail },
      telephone: { entity: AddressDetail },
      firstName: { entity: Contact },
      lastName: { entity: Contact }
    }
  }

  constructor (data = {}) {
    const invalidFields = Object.keys(data).filter((field) => !this.constructor.fields[field])
    if (invalidFields.length) {
      throw new Error(`Unexpected fields when instantiating ${this.constructor.name}: ${invalidFields.join(', ')}`)
    }

    // Now populate all the valid entered fields
    Object.entries(data)
      .forEach(([field, value]) => {
        this[field] = value
      })
  }

  static async get (context, { id, type }) {
    const { applicationId } = context

    if (!id && !type) {
      throw new Error('Expected either contact details id or type to be declared')
    }

    const addressDetail = id ? await AddressDetail.getById(context, id) : await AddressDetail.getBy(context, { applicationId, type })
    if (addressDetail) {
      const { id, jobTitle, firstName, lastName, email, telephone, type } = addressDetail
      return new ContactDetail({ id, applicationId, firstName, lastName, jobTitle, email, telephone, type })
    }
  }

  async save (context) {
    const { applicationId, firstName, lastName, jobTitle, telephone, email, type } = this
    let { id } = this

    if (!id && !type) {
      throw new Error('Expected either contact details id or type to be declared')
    }

    const addressDetail = id ? await AddressDetail.getById(context, id) : new AddressDetail({ applicationId, type })
    const contact = addressDetail.customerId ? await Contact.getById(context, addressDetail.customerId) : new Contact({})

    contact.firstName = firstName
    contact.lastName = lastName
    await contact.save(context)

    addressDetail.customerId = contact.id
    if (jobTitle) addressDetail.jobTitle = jobTitle
    if (email) addressDetail.email = email
    if (telephone) addressDetail.telephone = telephone
    if (firstName) addressDetail.firstName = firstName
    if (lastName) addressDetail.lastName = lastName
    id = await addressDetail.save(context)

    // Link the contact with the account if it isn't already
    const account = await Account.getByApplicationId(context, applicationId)
    if (account) {
      const linkedAccounts = await contact.listLinked(context, account)
      const link = linkedAccounts.find((linkedAccount) => linkedAccount.id === account.id)

      if (!link) {
        await contact.link(context, account)
      }
    }

    return id
  }

  async delete (context) {
    const { id, applicationId } = this

    const addressDetail = await AddressDetail.getById(context, id)
    if (!addressDetail) {
      return
    }

    const contact = await Contact.getById(context, addressDetail.customerId)
    await addressDetail.delete(context)

    // Unlink the contact with the account if it is linked
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
