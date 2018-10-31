'use strict'

const BaseEntity = require('./base.entity')

class Item extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_items'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_itemid' },
      { field: 'itemName', dynamics: 'defra_name' },
      { field: 'displayName', dynamics: 'defra_displayname' },
      { field: 'itemTypeId', dynamics: '_defra_itemtypeid_value', bind: { id: 'defra_itemtypeid', dynamicsEntity: 'defra_itemtypes' } },
      { field: 'code', dynamics: 'defra_code' },
      { field: 'description', dynamics: 'defra_description' },
      { field: 'description2', dynamics: 'defra_description2' },
      { field: 'suffix', dynamics: 'defra_suffix' },
      // { field: 'canApplyFor', dynamics: 'defra_canapplyfor' },
      { field: 'canApplyOnline', dynamics: 'defra_canapplyonline' }
    ]
  }

  // May be required for reading available assessments
  // static async getByItemTypeAndTypeCode (context, itemTypeId, typeCode) {
  //   return super.getBy(context, { itemTypeId, typeCode })
  // }
  //
  // static async listByItemTypeId (context, itemTypeId) {
  //   return this.listBy(context, { canApplyFor: true, itemTypeId }, 'itemTypeId')
  // }
}

Item.setDefinitions()

module.exports = Item
