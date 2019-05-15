'use strict'

const BaseEntity = require('./base.entity')

class ApplicationReturn extends BaseEntity {
  static get dynamicsEntity () {
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
    applicationId = applicationId || context.applicationId
    return super.getBy(context, { applicationId })
  }

  static async getBySlug (context, slug) {
    return super.getBy(context, { slug })
  }
}

ApplicationReturn.setDefinitions()

module.exports = ApplicationReturn
