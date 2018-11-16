'use strict'

const { RESPONSIBLE_CONTACT_DETAILS, PARTNER_CONTACT_DETAILS } = require('../../dynamics').AddressTypes

const BaseTask = require('./base.task')
const LoggingService = require('../../services/logging.service')
const ContactDetail = require('../contactDetail.model')
const Account = require('../../persistence/entities/account.entity')
const Address = require('../../persistence/entities/address.entity')
const { INDIVIDUAL_PERMIT_HOLDER } = require('../../dynamics').AddressTypes
const type = INDIVIDUAL_PERMIT_HOLDER.TYPE

const minPartners = 2

module.exports = class PermitHolderDetails extends BaseTask {
  static async getAddress (request, applicationId) {
    let address
    try {
      const context = request.app.data
      // Get the Individual details for this application
      const contactDetail = await ContactDetail.get(context, { type }) || new ContactDetail({ applicationId, type })

      if (contactDetail && contactDetail.addressId !== undefined) {
        // Get the Address for this AddressDetail
        address = await Address.getById(context, contactDetail.addressId)
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return address
  }

  static async saveSelectedAddress (request, addressDto) {
    const context = request.app.data
    const { applicationId } = context

    if (!addressDto.uprn) {
      const errorMessage = `Unable to save individual permit holder address as it does not have a UPRN`
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    const contactDetail = await ContactDetail.get(context, { type }) || new ContactDetail({ applicationId, type })

    let address = await Address.getByUprn(context, addressDto.uprn)
    if (!address) {
      // The address is not already in Dynamics so look it up in AddressBase and save it in Dynamics
      let addresses = await Address.listByPostcode(context, addressDto.postcode)
      addresses = addresses.filter((element) => element.uprn === addressDto.uprn)
      address = addresses.pop()
      if (address) {
        await address.save(context)
      }
    }

    // Save the Individual Contact Details to associate the Address with the Application
    if (address && contactDetail) {
      contactDetail.addressId = address.id
      await contactDetail.save(context)
    }
  }

  static async saveManualAddress (request, addressDto) {
    const context = request.app.data
    const { applicationId } = context

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the Individual Details for this Application (if there is one)
    const contactDetail = await ContactDetail.get(context, { type }) || new ContactDetail({ applicationId, type })

    // Get the Address for this AddressDetail (if there is one)
    let address = await Address.getById(context, contactDetail.addressId)
    if (!address || address.fromAddressLookup) {
      // Create a new address if changing from a selected address
      address = new Address(addressDto)
    } else {
      Object.assign(address, addressDto)
    }
    address.fromAddressLookup = false
    await address.save(context)

    // Save the Individual Contact Details to associate the Address with the Application
    if (address && contactDetail) {
      contactDetail.addressId = address.id
      await contactDetail.save(context)
    }
  }

  static async checkComplete (context) {
    const { application } = context
    const { isIndividual, isPartnership, isPublicBody, permitHolderOrganisationId } = application

    if (isIndividual) {
      // Get the Contact for this application
      const type = INDIVIDUAL_PERMIT_HOLDER.TYPE
      const { firstName, lastName, telephone, email } = await ContactDetail.get(context, { type }) || {}
      return Boolean(firstName && lastName && telephone && email)
    }

    if (isPublicBody) {
      const type = RESPONSIBLE_CONTACT_DETAILS.TYPE
      const { firstName, lastName, email, jobTitle } = await ContactDetail.get(context, { type }) || {}
      return Boolean(firstName && lastName && email && jobTitle)
    }

    // Get the Account for this application
    const account = await Account.getById(context, permitHolderOrganisationId)

    if (isPartnership) {
      const type = PARTNER_CONTACT_DETAILS.TYPE
      const list = await ContactDetail.list(context, { type })
      if (list.length < minPartners) {
        return false
      }

      // return true if no incomplete contacts are found
      const incompleteContact = list.find(({ firstName, lastName, dateOfBirth, telephone }) => !firstName || !lastName || !dateOfBirth || !telephone)
      return !incompleteContact
    }

    // When other organisation types
    return Boolean(account && account.accountName)
  }
}
