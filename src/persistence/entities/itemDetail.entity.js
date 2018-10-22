'use strict'

const BaseEntity = require('./base.entity')
const ItemDetailType = require('./itemDetailType.entity')

class ItemDetail extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_itemdetails'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [
      { field: 'id', dynamics: 'defra_itemdetailid' },
      { field: 'itemId', dynamics: '_defra_itemid_value', bind: { id: 'defra_itemid', dynamicsEntity: 'defra_items' } },
      { field: 'itemDetailTypeId', dynamics: '_defra_itemdetailtypeid_value', bind: { id: 'defra_itemdetailtypeid', dynamicsEntity: 'defra_itemdetailtypes' } },
      { field: 'value', dynamics: 'defra_value', encode: true } // ,
      // Will be used for assessments
      // { field: 'parentId', dynamics: '_defra_itemdetailparentid_value', bind: { id: 'defra_itemdetailid', dynamicsEntity: 'defra_itemdetails' } }
    ]
  }

  // Will be used for assessments
  // static async listByParentIdAndItemDetailTypeId (context, parentId, itemDetailTypeId) {
  //   return this.listBy(context, { parentId, itemDetailTypeId }, 'itemId')
  // }

  static async listByItemDetailTypeIdAndValue (context, itemDetailTypeId, value) {
    return this.listBy(context, { itemDetailTypeId, value }, 'itemId')
  }

  static async listByItemDetailTypeNameAndValue (context, itemDetailTypeName, value) {
    const idForName = await ItemDetailType.getByName(context, itemDetailTypeName)
    return this.listByItemDetailTypeIdAndValue(context, idForName.id, value)
  }

  // Will be used for assessments
  // static async listByParentIdAndItemDetailTypeName (context, parentId, itemDetailTypeName) {
  //   const idForName = await ItemDetailType.getByName(context, itemDetailTypeName)
  //   return this.listByParentIdAndItemDetailTypeId(context, parentId, idForName)
  // }

  static async listActivitiesForFacilityType (context, facilityTypeName) {
    return this.listByItemDetailTypeNameAndValue(context, 'facilitytype', facilityTypeName)
  }

  // Will be used for assessments
  // static async listRequiredAssessmentsForActivity (context, activityId) {
  //   return this.listByParentIdAndItemDetailTypeName(context, activityId, 'requiredforactivity')
  // }
  //
  // static async listOptionalAssessmentsForActivity (context, activityId) {
  //   return this.listByParentIdAndItemDetailTypeName(context, activityId, 'optionalforactivity')
  // }
}

ItemDetail.setDefinitions()

module.exports = ItemDetail
