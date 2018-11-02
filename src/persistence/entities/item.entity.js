'use strict'

const BaseEntity = require('./base.entity')
const ItemType = require('./itemType.entity')

const ASSESSMENT = 'wasteassessment'

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
      { field: 'shortName', dynamics: 'defra_shortname' },
      { field: 'itemTypeId', dynamics: '_defra_itemtypeid_value', bind: { id: 'defra_itemtypeid', dynamicsEntity: 'defra_itemtypes' } },
      { field: 'code', dynamics: 'defra_code' },
      { field: 'description', dynamics: 'defra_description' },
      { field: 'description2', dynamics: 'defra_description2' },
      { field: 'suffix', dynamics: 'defra_suffix' },
      { field: 'canApplyFor', dynamics: 'defra_canapplyfor' },
      { field: 'canApplyOnline', dynamics: 'defra_canapplyonline' }
    ]
  }

  static async listByItemTypeId (context, itemTypeId) {
    return this.listBy(context, { itemTypeId }, 'itemTypeId')
  }

  static async listByItemTypeShortName (context, itemTypeShortName) {
    const idForName = await ItemType.getByShortName(context, itemTypeShortName)
    return this.listByItemTypeId(context, idForName.id)
  }

  static async listAssessments (context) {
    return this.listByItemTypeShortName(context, ASSESSMENT)
  }
}

Item.setDefinitions()

module.exports = Item
