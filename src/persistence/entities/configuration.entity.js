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
      { field: 'status', dynamics: 'statuscode' },
      { field: 'value', dynamics: 'defra_value' }
    ]
  }

  static async getValue (context, key) {
    const list = await Configuration.listBy(context)
    if (list && list.length) {
      const config = list.find(({ title }) => title === key)
      if (config) {
        return config.value
      }
    }
  }
}

Configuration.setDefinitions()

module.exports = Configuration
