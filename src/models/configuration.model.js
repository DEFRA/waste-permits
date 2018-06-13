'use strict'

const BaseModel = require('./base.model')

class Configuration extends BaseModel {
  static get entity () {
    return 'defra_configurations'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      {field: 'title', dynamics: 'defra_name'},
      {field: 'status', dynamics: 'statuscode'}
    ]
  }

  static async list (context) {
    return super.listBy(context)
  }
}

Configuration.setDefinitions()

module.exports = Configuration
