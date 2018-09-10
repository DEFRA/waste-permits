'use strict'

const BaseModel = require('./base.model')

class ApplicationReturn extends BaseModel {
  static get entity () {
    return 'defra_saveandreturns'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'applicationId', dynamics: '_defra_application_value' },
      { field: 'slug', dynamics: 'defra_suffix', encode: true }
    ]
  }

  static async getByApplicationId (context, applicationId) {
    return super.getBy(context, { applicationId })
  }

  static async getBySlug (context, slug) {
    return super.getBy(context, { slug })
  }
}

ApplicationReturn.setDefinitions()

module.exports = ApplicationReturn
