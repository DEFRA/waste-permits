'use strict'

module.exports = class PermitType {
  constructor ({ id, key, text, canApplyOnline }) {
    this.id = id
    this.key = key
    this.text = text
    this.canApplyOnline = canApplyOnline
  }
}
