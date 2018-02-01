'use strict'

const Constants = require('../../constants')

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const ApplicationLine = require('../applicationLine.model')
const Address = require('../address.model')
const AddressDetail = require('../addressDetail.model')
const LoggingService = require('../../services/logging.service')

module.exports = class InvoiceAddress extends BaseModel {
  static async getAddress (request, authToken, applicationId) {
    let address
    try {
        // Get the AddressDetail for this application
      let addressDetail = await AddressDetail.getByApplicationIdAndType(authToken, applicationId, Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE)
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

  static async saveSelectedAddress (request, authToken, applicationId, applicationLineId, type, postcode, uprn) {
    if (!uprn) {
      const errorMessage = `Unable to save invoice address as it does not have a UPRN`
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    // Get the AddressDetail for this Application (if there is one)
    let addressDetail = await AddressDetail.getByApplicationIdAndType(authToken, applicationId, type)
    if (!addressDetail) {
      // Create new AddressDetail
      addressDetail = new AddressDetail({
        type: Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE,
        applicationId: applicationId
      })
      await addressDetail.save(authToken)
    }

    let address = await Address.getByUprn(authToken, uprn)
    if (!address) {
      // The address is not already in Dynamics so look it up in AddressBase and save it in Dynamics
      let addresses = await Address.listByPostcode(authToken, postcode)
      addresses = addresses.filter((element) => element.uprn === uprn)
      address = addresses.pop()
      await address.save(authToken)
    }

    // Save the AddressDetail to associate the Address with the Application
    if (address && addressDetail) {
      addressDetail.addressId = address.id
      await addressDetail.save(authToken)
    }

    await InvoiceAddress.updateCompleteness(authToken, applicationId, applicationLineId)
  }

  // TODO This will be used by the manual address entry page
  // static async saveManualAddress (request, addressDto, authToken, applicationId, applicationLineId) {

  // }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await InvoiceAddress._isComplete(authToken, applicationId, applicationLineId)

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

  static async _isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      const addressDetail = await AddressDetail.getByApplicationIdAndType(authToken, applicationId, Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE)
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
