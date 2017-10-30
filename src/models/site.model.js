'use strict'

const Constants = require('../constants')
const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')
const ApplicationLine = require('./applicationLine.model')

module.exports = class Site extends BaseModel {
  constructor (site) {
    super()
    this.id = site.id
    this.name = site.name
    this.gridReference = site.gridReference
    this.applicationId = site.applicationId
    this.applicationLineId = site.applicationLineId
  }

  isComplete () {
    // For now, we mark the item as complete if the site name is populated.
    // We will update this in the future when we add the other site screens.
    return this.name !== undefined &&
      this.gridReference !== undefined
  }

  static async getByApplicationId (authToken, applicationId, applicationLineId) {
    const dynamicsDal = new DynamicsDalService(authToken)
    const filter = `_defra_applicationid_value eq ${applicationId}`
    const query = encodeURI(`defra_locations?$select=defra_name&$filter=${filter}`)
    try {
      const response = await dynamicsDal.search(query)
      const result = response.value[0]

      let site
      if (result) {
        site = new Site({
          id: result.defra_locationid,
          applicationId: applicationId,
          applicationLineId: applicationLineId,
          name: result.defra_name,
          // TODO
          gridReference: 'TODO'
        })
      }
      return site
    } catch (error) {
      LoggingService.logError(`Unable to get Site by application ID: ${error}`)
      throw error
    }
  }

  async save (authToken) {
    const dynamicsDal = new DynamicsDalService(authToken)

    // Update the Site
    try {
      // Map the Site to the corresponding Dynamics schema Site object
      const dataObject = {
        defra_name: this.name,
        // TODO gird reference
        'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`
      }
      let query
      if (this.isNew()) {
        // New Site
        query = 'defra_locations'
        this.id = await dynamicsDal.create(query, dataObject)
      } else {
        // Update Site
        query = `defra_locations(${this.id})`
        await dynamicsDal.update(query, dataObject)
      }
    } catch (error) {
      LoggingService.logError(`Unable to save Site: ${error}`)
      throw error
    }

    // Update the completeness flag
    try {
      const applicationLine = await ApplicationLine.getById(authToken, this.applicationLineId)
      if (applicationLine) {
        const entity = {}
        entity[Constants.Dynamics.CompletedParamters.SITE_NAME_LOCATION] = true
        const query = `defra_wasteparamses(${applicationLine.parametersId})`
        await dynamicsDal.update(query, entity)
      }
    } catch (error) {
      LoggingService.logError(`Unable to update Site completeness: ${error}`)
      throw error
    }
  }
}
