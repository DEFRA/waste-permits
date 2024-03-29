'use strict'

const BaseTask = require('./base.task')
const Location = require('../../persistence/entities/location.entity')
const LocationDetail = require('../../persistence/entities/locationDetail.entity')
const Address = require('../../persistence/entities/address.entity')
const LoggingService = require('../../services/logging.service')
const Utilities = require('../../utilities/utilities')

module.exports = class SiteNameAndLocation extends BaseTask {
  static async getSiteName (request) {
    let siteName
    try {
      const context = request.app.data
      // Get the Location for this application (if we have one)
      const location = await Location.getByApplicationId(context)
      if (location) {
        siteName = location.siteName
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return siteName
  }

  static async saveSiteName (request, siteName) {
    try {
      const context = request.app.data
      const { applicationId, applicationLineId } = context

      // Get the Location for this application
      let location = await Location.getByApplicationId(context)
      if (!location) {
        // Create a Location in Dynamics
        location = new Location({
          siteName: siteName,
          applicationId,
          applicationLineId
        })
      } else {
        // Update existing Site
        location.siteName = siteName
      }
      await location.save(context)
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
  }

  static async getGridReference (request) {
    let gridReference
    try {
      const context = request.app.data

      // Get the Location for this application
      const location = await Location.getByApplicationId(context)

      if (location) {
        // Get the LocationDetail for this application (if there is one)
        const locationDetail = await LocationDetail.getByLocationId(context, location.id)
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

  static async saveGridReference (request, gridReference) {
    // Strip out whitespace from the grid reference, convert to upper case and save it
    gridReference = Utilities.stripWhitespace(gridReference).toUpperCase()
    try {
      const context = request.app.data

      // Get the Location for this application
      let location = await Location.getByApplicationId(context)
      if (!location) {
        // Create a Location in Dynamics
        const { applicationId, applicationLineId } = context
        location = new Location({
          siteName: 'Unknown site name',
          applicationId,
          applicationLineId
        })
        await location.save(context)
      }

      // Get the LocationDetail for this application (if there is one)
      let locationDetail = await LocationDetail.getByLocationId(context, location.id)
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

      await locationDetail.save(context)
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
  }

  static async getAddress (request) {
    let address
    try {
      const context = request.app.data
      // Get the Location for this application
      const location = await Location.getByApplicationId(context)

      if (location) {
        // Get the LocationDetail for this application
        const locationDetail = await LocationDetail.getByLocationId(context, location.id)

        if (locationDetail && locationDetail.addressId !== undefined) {
          // Get the Address for this Location Detail
          address = await Address.getById(context, locationDetail.addressId)
        }
      }
    } catch (error) {
      LoggingService.logError(error, request)
      throw error
    }
    return address
  }

  static async saveSelectedAddress (request, addressDto) {
    const context = request.app.data
    const { applicationId, applicationLineId } = context

    if (!addressDto.uprn) {
      const errorMessage = 'Unable to save site address as it does not have a UPRN'
      LoggingService.logError(errorMessage, request)
      throw new Error(errorMessage)
    }

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the Location for this application
    let location = await Location.getByApplicationId(context)
    if (!location) {
      // Create a Location in Dynamics
      location = new Location({
        siteName: 'Unknown site name',
        applicationId,
        applicationLineId
      })
      await location.save(context)
    }

    // Get the LocationDetail for this application (if there is one)
    let locationDetail = await LocationDetail.getByLocationId(context, location.id)
    if (!locationDetail) {
      // Create new LocationDetail
      locationDetail = new LocationDetail({
        siteName: location.siteName,
        gridReference: undefined,
        locationId: location.id
      })
      await locationDetail.save(context)
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

    // Save the LocationDetail to associate the Address with the Application
    if (address && locationDetail) {
      locationDetail.addressId = address.id
      await locationDetail.save(context)
    }
  }

  static async saveManualAddress (request, addressDto) {
    const context = request.app.data
    const { applicationId, applicationLineId } = context

    if (addressDto.postcode) {
      addressDto.postcode = addressDto.postcode.toUpperCase()
    }

    // Get the Location for this application
    let location = await Location.getByApplicationId(context)
    if (!location) {
      // Create a Location in Dynamics
      location = new Location({
        siteName: 'Unknown site name',
        applicationId,
        applicationLineId
      })
      await location.save(context)
    }

    // Get the LocationDetail for this application (if there is one)
    let locationDetail = await LocationDetail.getByLocationId(context, location.id)
    if (!locationDetail) {
      // Create new LocationDetail
      locationDetail = new LocationDetail({
        siteName: location.siteName,
        gridReference: undefined,
        locationId: location.id
      })
      await locationDetail.save(context)
    }

    // Get the Address for this AddressDetail (if there is one)
    let address = await Address.getById(context, locationDetail.addressId)
    if (!address || address.fromAddressLookup) {
      // Create a new address if changing from a selected address
      address = new Address(addressDto)
    } else {
      Object.assign(address, addressDto)
    }
    address.fromAddressLookup = false
    await address.save(context)

    // Save the LocationDetail to associate the Address with the Application
    if (address && locationDetail) {
      locationDetail.addressId = address.id
      await locationDetail.save(context)
    }
  }

  static async checkComplete (context) {
    // Get the Location for this application
    const location = await Location.getByApplicationId(context)

    // Get the LocationDetail
    let locationDetail
    if (location) {
      locationDetail = await LocationDetail.getByLocationId(context, location.id)
    }

    let address
    if (locationDetail) {
      address = await Address.getById(context, locationDetail.addressId)
    }

    return Boolean(location && locationDetail && address &&
        location.siteName !== undefined && location.siteName.length > 0 &&
        locationDetail.gridReference !== undefined && locationDetail.gridReference.length > 0)
  }
}
