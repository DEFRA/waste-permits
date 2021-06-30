'use strict'

const { AddressTypes, PERMIT_HOLDER_TYPES } = require('../../dynamics')
const { INDIVIDUAL_PERMIT_HOLDER } = AddressTypes

const BaseTask = require('./base.task')
const LoggingService = require('../../services/logging.service')
const ContactDetail = require('../contactDetail.model')
const CharityDetail = require('../charityDetail.model')
// const Account = require('../../persistence/entities/account.entity')
const Address = require('../../persistence/entities/address.entity')

const {
  INDIVIDUAL,
  LIMITED_COMPANY,
  PUBLIC_BODY
} = PERMIT_HOLDER_TYPES

const type = INDIVIDUAL_PERMIT_HOLDER.TYPE

module.exports = class PermitHolderDetails extends BaseTask {
  static async getAddress (request) {
    let address
    try {
      const context = request.app.data
      const { applicationId } = context
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
      const errorMessage = 'Unable to save individual permit holder address as it does not have a UPRN'
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

  static async getPermitHolderType (context) {
    const { permitHolderType } = context
    const { charityPermitHolder } = await CharityDetail.get(context) || {}

    switch (charityPermitHolder) {
      case INDIVIDUAL.id:
        return INDIVIDUAL
      case LIMITED_COMPANY.id:
        return LIMITED_COMPANY
      case PUBLIC_BODY.id:
        return PUBLIC_BODY
      default:
        return permitHolderType
    }
  }

  static isCharity (request) {
    const { app: { data = {} } } = request
    return Boolean(data.charityDetail && data.charityDetail.charityPermitHolder)
  }
}
