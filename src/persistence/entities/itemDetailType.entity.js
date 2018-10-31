'use strict'

const BaseEntity = require('./base.entity')

class ItemDetailType extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_itemdetailtypes'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_itemdetailtypeid' },
      { field: 'detailName', dynamics: 'defra_name', encode: true },
      { field: 'description', dynamics: 'defra_description' }
    ]
  }

  static async getByName (context, detailName) {
    return super.getBy(context, { detailName })
  }
}

ItemDetailType.setDefinitions()

module.exports = ItemDetailType
