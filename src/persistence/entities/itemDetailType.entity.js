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
      { field: 'detailTypeName', dynamics: 'defra_name' },
      { field: 'shortName', dynamics: 'defra_shortname', encode: true }
    ]
  }

  static async getByShortName (context, shortName) {
    return super.getBy(context, { shortName })
  }
}

ItemDetailType.setDefinitions()

module.exports = ItemDetailType
