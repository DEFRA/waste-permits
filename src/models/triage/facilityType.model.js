'use strict'

module.exports = class FacilityType {
  constructor ({ id, key, text, description, typeText, canApplyOnline }) {
    this.id = id
    this.key = key
    this.text = text
    this.description = description
    this.typeText = typeText
    this.canApplyOnline = canApplyOnline
  }
}
