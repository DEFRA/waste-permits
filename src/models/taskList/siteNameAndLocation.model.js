'use strict'

const Constants = require('../../constants')

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseModel = require('../base.model')
const ApplicationLine = require('../applicationLine.model')
const Location = require('../location.model')
const LocationDetail = require('../locationDetail.model')
const Address = require('../address.model')
const LoggingService = require('../../services/logging.service')
const Utilities = require('../../utilities/utilities')

module.exports = class SiteNameAndLocation extends BaseModel {
  static async getSiteName (request, authToken, applicationId, applicationLineId) {
    let siteName
    try {
      // Get the Location for this application (if we have one)
      const location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
      if (location) {
        siteName = location.siteName
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return siteName
  }

  static async saveSiteName (request, siteName, authToken, applicationId, applicationLineId) {
    try {
      // Get the Location for this application
      let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
      if (!location) {
        // Create a Location in Dynamics
        location = new Location({
          siteName: siteName,
          applicationId: applicationId,
          applicationLineId: applicationLineId
        })
      } else {
        // Update existing Site
        location.siteName = siteName
      }
      await location.save(authToken)
      await SiteNameAndLocation.updateCompleteness(authToken, applicationId, applicationLineId)
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
  }

  static async getGridReference (request, authToken, applicationId, applicationLineId) {
    let gridReference
    try {
      // Get the Location for this application
      let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)

      if (location) {
        // Get the LocationDetail for this application (if there is one)
        let locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
        if (locationDetail) {
          gridReference = locationDetail.gridReference
        }
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return gridReference
  }

  static async saveGridReference (request, gridReference, authToken, applicationId, applicationLineId) {
    // Strip out whitespace from the grid reference, convert to upper case and save it
    gridReference = Utilities.stripWhitespace(gridReference).toUpperCase()
    try {
      // Get the Location for this application
      let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
      if (!location) {
        // Create a Location in Dynamics
        location = new Location({
          siteName: 'Unknown site name',
          applicationId: applicationId,
          applicationLineId: applicationLineId
        })
        await location.save(authToken)
      }

      // Get the LocationDetail for this application (if there is one)
      let locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
      if (!locationDetail) {
        // Create new LocationDetail
        locationDetail = new LocationDetail({
          siteName: location.siteName,
          gridReference: gridReference,
          locationId: location.id
        })
      } else {
        // Update existing LocationDetail
        locationDetail.gridReference = gridReference
      }

      await locationDetail.save(authToken)
      await SiteNameAndLocation.updateCompleteness(authToken, applicationId, applicationLineId)
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
  }

  static async getAddress (request, authToken, applicationId, applicationLineId) {
    let address
    try {
      // Get the Location for this application
      let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)

      if (location) {
        // Get the LocationDetail for this application
        let locationDetail = await LocationDetail.getByLocationId(authToken, location.id)

        if (locationDetail && locationDetail.addressId !== undefined) {
          // Get the Address for this Location Detail
          address = await Address.getById(authToken, locationDetail.addressId)
        }
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return address
  }

  static async saveSelectedAddress (request, authToken, applicationId, applicationLineId, addressDto) {
    if (!addressDto.uprn) {
      const errorMessage = `Unable to save site address as it does not have a UPRN`
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the Location for this application
    let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
    if (!location) {
      // Create a Location in Dynamics
      location = new Location({
        siteName: 'Unknown site name',
        applicationId: applicationId,
        applicationLineId: applicationLineId
      })
      await location.save(authToken)
    }

    // Get the LocationDetail for this application (if there is one)
    let locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
    if (!locationDetail) {
      // Create new LocationDetail
      locationDetail = new LocationDetail({
        siteName: location.siteName,
        gridReference: undefined,
        locationId: location.id
      })
      await locationDetail.save(authToken)
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

    // Save the LocationDetail to associate the Address with the Application
    if (address && locationDetail) {
      locationDetail.addressId = address.id
      await locationDetail.save(authToken)
    }

    await SiteNameAndLocation.updateCompleteness(authToken, applicationId, applicationLineId)
  }

  static async saveManualAddress (request, authToken, applicationId, applicationLineId, addressDto) {
    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the Location for this application
    let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
    if (!location) {
      // Create a Location in Dynamics
      location = new Location({
        siteName: 'Unknown site name',
        applicationId: applicationId,
        applicationLineId: applicationLineId
      })
      await location.save(authToken)
    }

    // Get the LocationDetail for this application (if there is one)
    let locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
    if (!locationDetail) {
      // Create new LocationDetail
      locationDetail = new LocationDetail({
        siteName: location.siteName,
        gridReference: undefined,
        locationId: location.id
      })
      await locationDetail.save(authToken)
    }

    // Get the Address for this AddressDetail (if there is one)
    let address = await Address.getById(authToken, locationDetail.addressId)
    if (!address) {
      address = new Address(addressDto)
    } else {
      Object.assign(address, addressDto)
    }
    address.fromAddressLookup = false
    await address.save(authToken)

    // Save the LocationDetail to associate the Address with the Application
    if (address && locationDetail) {
      locationDetail.addressId = address.id
      await locationDetail.save(authToken)
    }

    await SiteNameAndLocation.updateCompleteness(authToken, applicationId, applicationLineId)
  }

  static async updateCompleteness (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)

    try {
      const applicationLine = await ApplicationLine.getById(authToken, applicationLineId)
      const isComplete = await SiteNameAndLocation._isComplete(authToken, applicationId, applicationLineId)

      const entity = {
        [Constants.Dynamics.CompletedParamters.SITE_NAME_LOCATION]: isComplete
      }
      const query = `defra_wasteparamses(${applicationLine.parametersId})`
      await dynamicsDal.update(query, entity)
    } catch (error) {
      LoggingService.logError(`Unable to update SiteNameAndLocation completeness: ${error}`)
      throw error
    }
  }

  static async _isComplete (authToken, applicationId, applicationLineId) {
    let isComplete = false
    try {
      // Get the Location for this application
      const location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)

      // Get the LocationDetail
      let locationDetail
      if (location) {
        locationDetail = await LocationDetail.getByLocationId(authToken, location.id)
      }

      let address
      if (locationDetail) {
        address = await Address.getById(authToken, locationDetail.addressId)
      }

      if (location && locationDetail && address) {
        isComplete =
          location.siteName !== undefined && location.siteName.length > 0 &&
          locationDetail.gridReference !== undefined && locationDetail.gridReference.length > 0
      }
    } catch (error) {
      LoggingService.logError(`Unable to calculate SiteNameAndLocation completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
