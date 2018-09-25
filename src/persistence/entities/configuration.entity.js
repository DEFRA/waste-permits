'use strict'

const BaseModel = require('./base.entity')

class Configuration extends BaseModel {
  static get dynamicsEntity () {
    return 'defra_configurations'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'title', dynamics: 'defra_name' },
      { field: 'status', dynamics: 'statuscode' }
    ]
  }
}

Configuration.setDefinitions()

module.exports = Configuration
