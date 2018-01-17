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
        siteName = location.name
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
          name: siteName,
          applicationId: applicationId,
          applicationLineId: applicationLineId
        })
      } else {
        // Update existing Site
        location.name = siteName
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
          name: undefined,
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

  static async saveAddress (request, addressDto, authToken, applicationId, applicationLineId) {
    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    try {
      // Get the Location for this application
      let location = await Location.getByApplicationId(authToken, applicationId, applicationLineId)
      if (!location) {
        // Create a Location in Dynamics
        location = new Location({
          name: undefined,
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
          gridReference: undefined,
          locationId: location.id
        })
        await locationDetail.save(authToken)
      }

      // Get the Address for this Location Detail (if there is one)
      let isNewAddress = false
      let address

      if (locationDetail.addressId !== undefined) {
        address = await Address.getById(authToken, locationDetail.addressId)
      }

      if (!address) {
        // Create new Address
        address = new Address({
          postcode: addressDto.postcode,
          locationId: location.id
        })
        isNewAddress = true
      } else {
        // Update existing Address
        address.postcode = addressDto.postcode
      }

      await address.save(authToken)

      // If the Address was new then we need to associate it with the Location Detail in Dynamics
      if (isNewAddress) {
        locationDetail.setAddress(address.id)
        locationDetail.save(authToken)
      }

      await SiteNameAndLocation.updateCompleteness(authToken, applicationId, applicationLineId)
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
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

      // Get the Address
      let address
      if (locationDetail) {
        address = await Address.getById(authToken, locationDetail.addressId)
      }

      if (location && locationDetail && address) {
        isComplete =
          location.name !== undefined && location.name.length > 0 &&
          locationDetail.gridReference !== undefined && locationDetail.gridReference.length > 0 &&
          address.postcode !== undefined && address.postcode.length > 0
      }
    } catch (error) {
      LoggingService.logError(`Unable to calculate SiteNameAndLocation completeness: ${error}`)
      throw error
    }
    return isComplete
  }
}
