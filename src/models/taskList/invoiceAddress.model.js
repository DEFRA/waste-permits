'use strict'

const Constants = require('../../constants')

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const ApplicationLine = require('../applicationLine.model')
const Address = require('../address.model')
const AddressDetail = require('../addressDetail.model')
const LoggingService = require('../../services/logging.service')

module.exports = class InvoiceAddress extends BaseModel {
  static async getAddress (request, authToken, applicationId, applicationLineId) {
    let address
    try {
      // Get the AddressDetail for this application
      const addressDetail = await AddressDetail.getBillingInvoicingDetails(authToken, applicationId)

      if (addressDetail && addressDetail.addressId !== undefined) {
        // Get the Address for this AddressDetail
        address = await Address.getById(authToken, addressDetail.addressId)
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return address
  }

  static async saveSelectedAddress (request, authToken, applicationId, applicationLineId, addressDto) {
    if (!addressDto.uprn) {
      const errorMessage = `Unable to save invoice address as it does not have a UPRN`
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    let addressDetail = await AddressDetail.getBillingInvoicingDetails(authToken, applicationId)
    if (!addressDetail.addressId) {
      await addressDetail.save(authToken)
    }

    let address = await Address.getByUprn(authToken, addressDto.uprn)
    if (!address) {
      // The address is not already in Dynamics so look it up in AddressBase and save it in Dynamics
      let addresses = await Address.listByPostcode(authToken, addressDto.postcode)
      addresses = addresses.filter((element) => element.uprn === addressDto.uprn)
      address = addresses.pop()
      if (address) {
        await address.save(authToken)
      }
    }

    // Save the AddressDetail to associate the Address with the Application
    if (address && addressDetail) {
      addressDetail.addressId = address.id
      await addressDetail.save(authToken)
    }

    await InvoiceAddress.updateCompleteness(authToken, applicationId, applicationLineId)
  }

  static async saveManualAddress (request, authToken, applicationId, applicationLineId, addressDto) {
    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the AddressDetail for this Application (if there is one)
    let addressDetail = await AddressDetail.getBillingInvoicingDetails(authToken, applicationId)
    if (!addressDetail.addressId) {
      await addressDetail.save(authToken)
    }

    // Get the Address for this AddressDetail (if there is one)
    let address = await Address.getById(authToken, addressDetail.addressId)
    if (!address) {
      address = new Address(addressDto)
    } else {
      Object.assign(address, addressDto)
    }
    address.fromAddressLookup = false
    await address.save(authToken)

    // Save the AddressDetail to associate the Address with the Application
    if (address && addressDetail) {
      addressDetail.addressId = address.id
      await addressDetail.save(authToken)
    }

    await InvoiceAddress.updateCompleteness(authToken, applicationId, applicationLineId)
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await InvoiceAddress.isComplete(authToken, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.INVOICING_DETAILS]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update InvoiceAddress completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId) {
    let isComplete = false
    try {
      const addressDetail = await AddressDetail.getBillingInvoicingDetails(authToken, applicationId)
      if (addressDetail && addressDetail.addressId) {
        isComplete = Address.getById(addressDetail.addressId) !== undefined
      }
    } catch (error) {
      LoggingService.logError(`Unable to calculate InvoiceAddress completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
