'use strict'

module.exports = class Activity {
  constructor ({ id, key, text, activityCode, canApplyOnline }) {
    this.id = id
    this.key = key
    this.text = text
    this.activityCode = activityCode
    this.canApplyOnline = canApplyOnline
  }

  static createFromItemEntity (itemEntity) {
    return new Activity({
      id: itemEntity.shortName,
      key: itemEntity.shortName,
      text: itemEntity.itemName,
      activityCode: itemEntity.code,
      canApplyOnline: itemEntity.canApplyOnline
    })
  }
}
