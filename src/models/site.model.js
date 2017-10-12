'use strict'

const DynamicsDalService = require('../services/dynamicsDal.service')
const BaseModel = require('./base.model')
const LoggingService = require('../services/logging.service')

module.exports = class Site extends BaseModel {
  constructor (site) {
    super()
    this.id = site.id
    this.name = site.name
    this.applicationId = site.applicationId
  }

  static async getByApplicationId (authToken, applicationId) {
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
          name: result.defra_name
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

    // Map the Site to the corresponding Dynamics schema Site object
    const dataObject = {
      defra_name: this.name,
      'defra_applicationId@odata.bind': `defra_applications(${this.applicationId})`
    }

    try {
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
  }
}
