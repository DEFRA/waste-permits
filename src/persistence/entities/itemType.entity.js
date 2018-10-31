'use strict'

const BaseEntity = require('./base.entity')

class ItemType extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_itemtypes'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_itemtypeid' },
      { field: 'itemName', dynamics: 'defra_name' }
    ]
  }
}

ItemType.setDefinitions()

module.exports = ItemType