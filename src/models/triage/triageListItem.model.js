'use strict'

module.exports = class TriageListItem {
  constructor ({ id, key, text, description, canApplyOnline, facilityTypeText, mcpIsMobile, activityCode }) {
    this.id = id
    this.key = key
    this.text = text
    this.description = description
    this.facilityTypeText = facilityTypeText
    this.mcpIsMobile = mcpIsMobile
    this.activityCode = activityCode
    this.canApplyOnline = canApplyOnline
  }

  static createFacilityTypeFromDefinition (definition) {
    return new TriageListItem({
      id: definition.id,
      key: definition.key,
      text: definition.text,
      description: definition.description,
      facilityTypeText: definition.typeText,
      canApplyOnline: definition.canApplyOnline
    })
  }

  static createMcpTypeFromDefinition (definition) {
    return new TriageListItem({
      id: definition.id,
      key: definition.key,
      text: definition.text,
      description: definition.description,
      mcpIsMobile: definition.isMobile,
      canApplyOnline: definition.canApplyOnline
    })
  }

  static createMcpTypeFromItemEntity (itemEntity) {
    return new TriageListItem({
      id: itemEntity.shortName,
      key: itemEntity.shortName,
      text: itemEntity.itemName,
      canApplyOnline: itemEntity.canApplyOnline
    })
  }

  static createWasteActivityFromItemEntity (itemEntity) {
    return new TriageListItem({
      id: itemEntity.shortName,
      key: itemEntity.shortName,
      text: itemEntity.itemName,
      activityCode: itemEntity.code,
      canApplyOnline: itemEntity.canApplyOnline
    })
  }

  static createWasteAssessmentFromItemEntity (itemEntity) {
    return new TriageListItem({
      id: itemEntity.shortName,
      key: itemEntity.shortName,
      text: itemEntity.itemName,
      canApplyOnline: itemEntity.canApplyOnline
    })
  }
}
