'use strict'

module.exports = class Assessment {
  constructor ({ id, key, text, canApplyOnline }) {
    this.id = id
    this.key = key
    this.text = text
    this.canApplyOnline = canApplyOnline
  }

  static createFromItemEntity (itemEntity) {
    return new Assessment({
      id: itemEntity.shortName,
      key: itemEntity.shortName,
      text: itemEntity.itemName,
      canApplyOnline: itemEntity.canApplyOnline
    })
  }
}
