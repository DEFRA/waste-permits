'use strict'

const { PERMIT_TYPE_LIST, PERMIT_HOLDER_TYPE_LIST, FACILITY_TYPE_LIST, MCP_TYPE_LIST } = require('./triageLists')
const TriageListItem = require('./triageListItem.model')
const ItemEntity = require('../../persistence/entities/item.entity')

module.exports = class TriageList {
  constructor (listItemsArray) {
    this.listItemsArray = listItemsArray
  }

  get items () {
    return this.listItemsArray
  }

  get ids () {
    return this.listItemsArray.map((item) => item.id)
  }

  get canApplyOnline () {
    return this.listItemsArray.length !== 0 && !this.listItemsArray.find((item) => !item.canApplyOnline)
  }

  entry (id) {
    return this.listItemsArray.find((item) => item.id === id)
  }

  getListFilteredByIds (ids) {
    const selectedItems = this.listItemsArray.filter((item) => ids.find((id) => id === item.id))
    return new TriageList(selectedItems)
  }

  get facilityTypeText () {
    const list = this.listItemsArray.map((item) => item.facilityTypeText)
    const retval = list.slice(0, -2).join(', ') + (list.slice(0, -2).length ? ', ' : '') + list.slice(-2).join(' and ')
    return retval
  }

  setSelectedByIds (ids) {
    ids.forEach((id) => {
      const entry = this.entry(id)
      if (entry) {
        entry.isSelected = true
      }
    })
  }

  static async createPermitTypesList (context) {
    const permitTypes = PERMIT_TYPE_LIST.map((item) => new TriageListItem(item))
    return new TriageList(permitTypes)
  }

  static async createPermitHolderTypesList (context) {
    // All permit types have the same, full list of permit holder types
    const permitHolderTypes = PERMIT_HOLDER_TYPE_LIST.map((item) => new TriageListItem(item))
    return new TriageList(permitHolderTypes)
  }

  static async createFacilityTypesList (context, { selectedPermitTypes }) {
    let facilityTypes = []
    // Only bespoke permit types have facilities
    if (selectedPermitTypes.entry('bespoke')) {
      // All permit holder types have the same list of facility types
      facilityTypes = FACILITY_TYPE_LIST.map((item) => TriageListItem.createFacilityTypeFromDefinition(item))
    }
    return new TriageList(facilityTypes)
  }

  static async createMcpTypesList (context, { selectedPermitTypes, selectedFacilityTypes }) {
    let mcpTypes = []
    // Only bespoke permit types have MCP types
    if (selectedPermitTypes.entry('bespoke')) {
      // All permit holder types have the same list of MCP types
      // Only MCP facility types have MCP types
      if (selectedFacilityTypes.entry('mcp')) {
        mcpTypes = MCP_TYPE_LIST.map((item) => TriageListItem.createMcpTypeFromDefinition(item))
      }
    }
    return new TriageList(mcpTypes)
  }

  static async createWasteActivitiesList (context, { selectedPermitTypes, selectedFacilityTypes }) {
    let wasteActivities = []
    // Only bespoke permit types have waste activities
    if (selectedPermitTypes.entry('bespoke')) {
      // All permit holder types have the same list of activities
      // The relevant activities for each facility type are stored in the entities, so we have to look them up
      if (selectedFacilityTypes.items.length !== 0) {
        const facilityTypeIds = selectedFacilityTypes.ids
        const wasteActivityEntities = await ItemEntity.listWasteActivitiesForFacilityTypes(context, facilityTypeIds)
        // Filter out any that can no longer be applied for, i.e. they should not appear to a user
        const filteredWasteActivityEntities = wasteActivityEntities.filter((item) => item.canApplyFor)
        wasteActivities = filteredWasteActivityEntities.map((item) => TriageListItem.createWasteActivityFromItemEntity(item))
      }
    }
    return new TriageList(wasteActivities)
  }

  static async createIncludedWasteAssessmentsList (context, { selectedWasteActivities }) {
    // Currently all waste assessments are optional, so none are included
    return new TriageList([])
  }

  static async createOptionalWasteAssessmentsList (context, { selectedWasteActivities }) {
    // Currently all waste assessments are optional
    let wasteAssessments = []

    // Waste assessments only apply to waste activities
    if (selectedWasteActivities.items.length !== 0) {
      // Currently all waste assessments are optional
      const allWasteAssessmentEntities = await ItemEntity.listWasteAssessments(context)
      const filteredWasteAssessmentEntities = allWasteAssessmentEntities.filter((item) => item.canApplyFor)
      wasteAssessments = filteredWasteAssessmentEntities.map((item) => TriageListItem.createWasteAssessmentFromItemEntity(item))
    }

    return new TriageList(wasteAssessments)
  }
}
