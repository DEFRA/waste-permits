'use strict'

const {PERMIT_HOLDER_DETAILS} = require('../../dynamics').CompletedParamters

const Completeness = require('./completeness.model')
const LoggingService = require('../../services/logging.service')
const Account = require('../account.model')
const Application = require('../application.model')
const Contact = require('../contact.model')
const Address = require('../address.model')
const AddressDetail = require('../addressDetail.model')

module.exports = class PermitHolderDetails extends Completeness {
  static async getAddress (request, applicationId) {
    let address
    try {
      const context = request.app.data
      // Get the AddressDetail for this application
      const addressDetail = await AddressDetail.getIndividualPermitHolderDetails(context, applicationId)

      if (addressDetail && addressDetail.addressId !== undefined) {
        // Get the Address for this AddressDetail
        address = await Address.getById(context, addressDetail.addressId)
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return address
  }

  static async saveSelectedAddress (request, applicationId, applicationLineId, addressDto) {
    const context = request.app.data
    if (!addressDto.uprn) {
      const errorMessage = `Unable to save individual permit holder address as it does not have a UPRN`
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    let addressDetail = await AddressDetail.getIndividualPermitHolderDetails(context, applicationId)
    if (!addressDetail.addressId) {
      await addressDetail.save(context)
    }

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

    // Save the AddressDetail to associate the Address with the Application
    if (address && addressDetail) {
      addressDetail.addressId = address.id
      await addressDetail.save(context)
    }
  }

  static async saveManualAddress (request, applicationId, applicationLineId, addressDto) {
    const context = request.app.data
    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the AddressDetail for this Application (if there is one)
    let addressDetail = await AddressDetail.getIndividualPermitHolderDetails(context, applicationId)
    if (!addressDetail.addressId) {
      await addressDetail.save(context)
    }

    // Get the Address for this AddressDetail (if there is one)
    let address = await Address.getById(context, addressDetail.addressId)
    if (!address || address.fromAddressLookup) {
      // Create a new address if changing from a selected address
      address = new Address(addressDto)
    } else {
      Object.assign(address, addressDto)
    }
    address.fromAddressLookup = false
    await address.save(context)

    // Save the AddressDetail to associate the Address with the Application
    if (address && addressDetail) {
      addressDetail.addressId = address.id
      await addressDetail.save(context)
    }
  }

  static get completenessParameter () {
    return PERMIT_HOLDER_DETAILS
  }

  static async checkComplete (context, applicationId) {
    const {isIndividual, permitHolderOrganisationId, permitHolderIndividualId} = await Application.getById(context, applicationId)

    if (isIndividual) {
      // Get the Contact for this application
      const contact = await Contact.getById(context, permitHolderIndividualId)
      const addressDetail = await AddressDetail.getIndividualPermitHolderDetails(context, applicationId)
      const address = await Address.getById(context, addressDetail.addressId)

      let isContactComplete = contact && contact.firstName && contact.lastName
      let isContactDetailComplete = addressDetail.dateOfBirth && addressDetail.telephone

      return Boolean(isContactComplete && isContactDetailComplete && address)
    } else {
      // Get the Account for this application
      const account = await Account.getById(context, permitHolderOrganisationId)
      return Boolean(account && account.accountName)
    }
  }
}
