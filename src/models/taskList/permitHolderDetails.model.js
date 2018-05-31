'use strict'

const Constants = require('../../constants')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const LoggingService = require('../../services/logging.service')
const Account = require('../account.model')
const Application = require('../application.model')
const ApplicationLine = require('../applicationLine.model')
const Contact = require('../contact.model')
const Address = require('../address.model')
const AddressDetail = require('../addressDetail.model')

module.exports = class PermitHolderDetails extends BaseModel {
  constructor (data) {
    super()
    this.applicationLineId = data.applicationLineId
  }

  static async getAddress (request, authToken, applicationId, applicationLineId) {
    let address
    try {
      // Get the AddressDetail for this application
      const addressDetail = await AddressDetail.getIndividualPermitHolderDetails(authToken, applicationId)

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
      const errorMessage = `Unable to save individual permit holder address as it does not have a UPRN`
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    let addressDetail = await AddressDetail.getIndividualPermitHolderDetails(authToken, applicationId)
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
  }

  static async saveManualAddress (request, authToken, applicationId, applicationLineId, addressDto) {
    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the AddressDetail for this Application (if there is one)
    let addressDetail = await AddressDetail.getIndividualPermitHolderDetails(authToken, applicationId)
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
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await PermitHolderDetails.isComplete(authToken, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.PERMIT_HOLDER_DETAILS]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update CompanyDetails completeness: ${error}`)
      throw error
    }
  }

  static async isComplete (authToken, applicationId) {
    let isComplete = false
    try {
      const {isIndividual, accountId, permitHolderIndividualId} = await Application.getById(authToken, applicationId)

      if (isIndividual) {
        // Get the Contact for this application
        const contact = await Contact.getById(authToken, permitHolderIndividualId)
        const addressDetail = await AddressDetail.getIndividualPermitHolderDetails(authToken, applicationId)
        const address = await Address.getById(authToken, addressDetail.addressId)

        let isContactComplete = contact && contact.firstName && contact.lastName
        let isContactDetailComplete = addressDetail.dateOfBirth && addressDetail.telephone

        isComplete = Boolean(isContactComplete && isContactDetailComplete && address)
      } else {
        // Get the Account for this application
        const account = await Account.getById(authToken, accountId)
        isComplete = Boolean(account && account.accountName)
      }
    } catch (error) {
      LoggingService.logError(`Unable to calculate PermitHolderDetails completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
