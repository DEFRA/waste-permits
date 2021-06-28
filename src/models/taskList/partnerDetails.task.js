'use strict'

const Handlebars = require('handlebars')

const BaseTask = require('./base.task')
const LoggingService = require('../../services/logging.service')
const CryptoService = require('../../services/crypto.service')
const ContactDetail = require('../../models/contactDetail.model')
const Address = require('../../persistence/entities/address.entity')
const { PARTNER_CONTACT_DETAILS } = require('../../dynamics').AddressTypes

module.exports = class PartnerDetails extends BaseTask {
  static get contactType () {
    return PARTNER_CONTACT_DETAILS.TYPE
  }

  static async getContactDetail (request) {
    const context = request.app.data
    const { partnerId } = request.params
    const id = CryptoService.decrypt(partnerId)
    return ContactDetail.get(context, { id })
  }

  static async getPageHeading (request, pageHeading) {
    const { firstName, lastName } = await this.getContactDetail(request)
    const name = `${firstName} ${lastName}`
    const heading = await Handlebars.compile(pageHeading)({ name })
    return heading.replace(/&#x27;/g, "'")
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

  static async saveSelectedAddress (request, addressDto) {
    const context = request.app.data
    if (!addressDto.uprn) {
      const errorMessage = 'Unable to save individual permit holder address as it does not have a UPRN'
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    const contactDetail = await this.getContactDetail(request)

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

    // Save the ContactDetail to associate the Address with the Application
    if (address && contactDetail) {
      contactDetail.addressId = address.id
      await contactDetail.save(context)
    }
  }

  static async saveManualAddress (request, addressDto) {
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
