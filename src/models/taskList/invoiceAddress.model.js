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

  static async savePostcode (request, addressDto, authToken, applicationId, applicationLineId) {
    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    try {
      // Get the AddressDetail for this application (if there is one)
      let addressDetail = await AddressDetail.getByApplicationIdAndType(authToken, applicationId, Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE)

      if (!addressDetail) {
        // Create new AddressDetail

        // TODO?
        // addressDetail = AddressDetail.dynamicsToModel(addressDto)
        addressDetail = new AddressDetail({
          type: Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE,
          applicationId: applicationId

          // TODO - determine if we are going to link to a customer
          // customerId: customerId
        })
        await addressDetail.save(authToken)
      }

      // Get the Address for this AddressDetail (if there is one)
      let address = await Address.getById(authToken, addressDetail.addressId)
      if (!address) {
        // Create new Address
        address = new Address({
          id: undefined,
          postcode: addressDto.postcode
        })
        await address.save(authToken)
      }

      // Now Update the address

      // If there is an existing Address but the Postcode is now different then update the AddressDetail
      if (addressDetail.addressId) {
        if (address.postcode !== addressDto.postcode) {
          addressDetail.addressId = address.id
          await addressDetail.save(authToken)
        }
      } else {
        // Link the Address to the AddressDetail
        addressDetail.addressId = address.id
        await addressDetail.save(authToken)
      }

      // let isNewAddress = false

      // if (addressDetail.addressId !== undefined) {
      //   address = await Address.getById(authToken, addressDetail.addressId)
      // }

      // if (!address) {
      //   // Create new Address
      //   address = new Address({
      //     id: undefined,
      //     // buildingNameOrNumber: addressDto.buildingNameOrNumber,
      //     // addressLine1: addressDto.addressLine1,
      //     // addressLine2: addressDto.addressLine2,
      //     postcode: addressDto.postcode,
      //     // fullAddress: addressDto.fullAddress,
      //     // uprn: addressDto.uprn,

      //     fromAddressLookup: true
      //     // fromAddressLookup: addressDto.fromAddressLookup
      //   })
      //   isNewAddress = true
      // } else {
      //   // Update existing Address

      //   // TODO: Confirm if we should only do this for manual entry??
      //   // address.buildingNameOrNumber = addressDto.buildingNameOrNumber
      //   // address.addressLine1 = addressDto.addressLine1
      //   // address.addressLine2 = addressDto.addressLine2
      //   address.postcode = addressDto.postcode
      //   // address.fullAddress = addressDto.fullAddress
      //   // address.uprn = addressDto.uprn

      //   // TODO - depends on whether selected or manual entry
      //   // address.fromAddressLookup = true
      //   // fromAddressLookup: false
      //   // this.fromAddressLookup = address.fromAddressLookup
      //   fromAddressLookup: true
      // }

      // await address.save(authToken)

      // If the Address was new then we need to associate it with the AddressDetail in Dynamics
      // if (isNewAddress) {
      //   addressDetail.setAddress(address.id)
      //   await addressDetail.save(authToken)
      // }

      // TODO
      // await InvoiceAddress.updateCompleteness(authToken, applicationId, applicationLineId)
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
  }

  // static async saveAddress (request, addressDto, authToken, applicationId, applicationLineId) {
  //   if (addressDto.postcode) {
  //     addressDto.postcode = addressDto.postcode.toUpperCase()
  //   }

  //   try {
  //     // Get the AddressDetail for this application (if there is one)
  //     let addressDetail = await AddressDetail.getByApplicationIdAndType(authToken, applicationId, Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE)

  //     if (!addressDetail) {
  //       // Create new AddressDetail

  //       // addressDetail = AddressDetail.dynamicsToModel(addressDto)
  //       addressDetail = new AddressDetail({
  //         type: Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE,
  //         applicationId: applicationId

  //         // TODO - determine if we are going to link to a customer
  //         // customerId: customerId
  //       })
  //       await addressDetail.save(authToken)
  //     }

  //     // Get the Address for this AddressDetail (if there is one)
  //     let isNewAddress = false
  //     let address

  //     if (addressDetail.addressId !== undefined) {
  //       address = await Address.getById(authToken, addressDetail.addressId)
  //     }

  //     if (!address) {
  //       // Create new Address
  //       address = new Address({
  //         id: undefined,
  //         buildingNameOrNumber: addressDto.buildingNameOrNumber,
  //         addressLine1: addressDto.addressLine1,
  //         addressLine2: addressDto.addressLine2,
  //         postcode: addressDto.postcode,
  //         fullAddress: addressDto.fullAddress,
  //         uprn: addressDto.uprn,

  //         fromAddressLookup: true
  //       // fromAddressLookup: addressDto.fromAddressLookup
  //       })
  //       isNewAddress = true
  //     } else {
  //       // Update existing Address

  //       // TODO: Confirm if we should only do this for manual entry??
  //       // address.buildingNameOrNumber = addressDto.buildingNameOrNumber
  //       // address.addressLine1 = addressDto.addressLine1
  //       // address.addressLine2 = addressDto.addressLine2
  //       // address.postcode = addressDto.postcode
  //       // address.fullAddress = addressDto.fullAddress
  //       // address.uprn = addressDto.uprn

  //       // TODO - depends on whether selected or manual entry
  //       address.fromAddressLookup = true
  //       // fromAddressLookup: false
  //       // this.fromAddressLookup = address.fromAddressLookup
  //     }

  //     await address.save(authToken)

  //     // If the Address was new then we need to associate it with the AddressDetail in Dynamics
  //     if (isNewAddress) {
  //       addressDetail.setAddress(address.id)
  //       await addressDetail.save(authToken)
  //     }

  //     // TODO
  //     // await InvoiceAddress.updateCompleteness(authToken, applicationId, applicationLineId)
  //   } catch (error) {
  //     LoggingService.logError(error, request)
  //     throw error
  //   }
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
      // TODO: determine how we tell if an InvoiceDetail is complete

      // // Get the Location for this application
      // const location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)

      // // Get the LocationDetail
      // let locationDetail
      // if (location) {
      //   locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
      // }

      // // Get the Address
      // let address
      // if (locationDetail) {
      //   address = await Address.getById(authToken, locationDetail.addressId)
      // }

      // if (location && locationDetail && address) {
      //   isComplete =
      //     location.name !== undefined && location.name.length > 0 &&
      //     locationDetail.gridReference !== undefined && locationDetail.gridReference.length > 0 &&
      //     address.postcode !== undefined && address.postcode.length > 0
      // }
    } catch (error) {
      LoggingService.logError(`Unable to calculate InvoiceAddress completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
