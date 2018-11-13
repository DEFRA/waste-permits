'use strict'

const BaseEntity = require('./base.entity')

class ApplicationData extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_webdatas'
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_webdataid' },
      { field: 'applicationId', dynamics: '_defra_applicationid_value', bind: { id: 'defra_applicationid', relationship: 'defra_defra_application_defra_webdata', dynamicsEntity: 'defra_applications' } },
      { field: 'data', dynamics: 'defra_data', length: { max: 20000 } }
    ]
  }
}

ApplicationData.setDefinitions()

module.exports = ApplicationData
