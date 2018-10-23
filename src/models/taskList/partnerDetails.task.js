'use strict'

const Handlebars = require('handlebars')

const BaseTask = require('./base.task')
const LoggingService = require('../../services/logging.service')
const CryptoService = require('../../services/crypto.service')
const ContactDetail = require('../../models/contactDetail.model')
const Address = require('../../persistence/entities/address.entity')
const AddressDetail = require('../../persistence/entities/addressDetail.entity')

module.exports = class PartnerDetails extends BaseTask {
  static async getContactDetail (request) {
    const context = request.app.data
    let { partnerId } = request.params
    const id = CryptoService.decrypt(partnerId)
    return ContactDetail.get(context, { id })
  }

  static async getPageHeading (request, pageHeading) {
    const { firstName, lastName } = await this.getContactDetail(request)
    return Handlebars.compile(pageHeading)({
      name: `${firstName} ${lastName}`
    })
  }

  static async getAddress (request) {
    let address
    try {
      const context = request.app.data
      const { addressId } = await this.getContactDetail(request)
      if (addressId) {
        address = await Address.getById(context, addressId)
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

    const { contactId } = await this.getContactDetail(request)

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

    const contactDetail = await this.getContactDetail(request)
    // Get the Address for this ContactDetail (if there is one)
    let address = await Address.getById(context, contactDetail.addressId)
    if (!address || address.fromAddressLookup) {
      // Create a new address if changing from a selected address
      address = new Address(addressDto)
    } else {
      Object.assign(address, addressDto)
    }
    address.fromAddressLookup = false
    await address.save(context)

    contactDetail.addressId = address.id
    return contactDetail.save(context)
  }
}
