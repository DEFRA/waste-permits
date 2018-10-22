'use strict'

const Handlebars = require('handlebars')

const BaseTask = require('./base.task')
const LoggingService = require('../../services/logging.service')
const CryptoService = require('../../services/crypto.service')
const ApplicationContact = require('../../persistence/entities/applicationContact.entity')
const Contact = require('../../persistence/entities/contact.entity')
const Address = require('../../persistence/entities/address.entity')
const AddressDetail = require('../../persistence/entities/addressDetail.entity')

module.exports = class PartnerDetails extends BaseTask {
  static async getApplicationContact (request) {
    const context = request.app.data
    let { partnerId } = request.params
    const applicationContactId = CryptoService.decrypt(partnerId)
    return ApplicationContact.getById(context, applicationContactId)
  }

  static async getPageHeading (request, pageHeading) {
    const context = request.app.data
    const { contactId } = await this.getApplicationContact(request)
    const { firstName, lastName } = await Contact.getById(context, contactId)
    return Handlebars.compile(pageHeading)({
      name: `${firstName} ${lastName}`
    })
  }

  static async getAddress (request, applicationId) {
    let address
    try {
      const context = request.app.data
      const { contactId } = await this.getApplicationContact(request)
      // Get the AddressDetail for this application
      const addressDetail = await AddressDetail.getPartnerDetails(context, applicationId, contactId)

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

    const { contactId } = await this.getApplicationContact(request)

    let addressDetail = await AddressDetail.getPartnerDetails(context, applicationId, contactId)
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

    const { contactId } = await this.getApplicationContact(request)

    // Get the AddressDetail for this Application (if there is one)
    let addressDetail = await AddressDetail.getPartnerDetails(context, applicationId, contactId)
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
}
