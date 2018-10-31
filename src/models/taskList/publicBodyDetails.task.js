'use strict'

const BaseTask = require('./base.task')
const Address = require('../../persistence/entities/address.entity')
const ContactDetail = require('../../models/contactDetail.model')
const LoggingService = require('../../services/logging.service')
const { PUBLIC_BODY_MAIN_ADDRESS } = require('../../dynamics').AddressTypes
const type = PUBLIC_BODY_MAIN_ADDRESS.TYPE

module.exports = class PublicBodyDetails extends BaseTask {
  static async getAddress (request, applicationId) {
    let address
    try {
      const context = request.app.data
      // Get the Public Body Main Address for this application
      const contactDetail = await ContactDetail.get(context, { type })

      if (contactDetail && contactDetail.addressId !== undefined) {
        // Get the Address for this Contact Detail
        address = await Address.getById(context, contactDetail.addressId)
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
      const errorMessage = `Unable to save public body address as it does not have a UPRN`
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

    // Save the ContactDetail to associate the Address with the Application
    if (address && contactDetail) {
      contactDetail.addressId = address.id
      await contactDetail.save(context)
    }
  }

  static async saveManualAddress (request, applicationId, applicationLineId, addressDto) {
    const context = request.app.data
    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the ContactDetail for this Application (if there is one)
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

    // Save the ContactDetail to associate the Address with the Application
    if (address && contactDetail) {
      contactDetail.addressId = address.id
      await contactDetail.save(context)
    }
  }
}
