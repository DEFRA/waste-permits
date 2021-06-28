'use strict'

const BaseEntity = require('./base.entity')

const WASTE_ACTIVITY = 'wasteactivity'
const WASTE_ASSESSMENT = 'wasteassessment'
const FACILITY_TYPE = 'facilitytype'
const MCP_TYPE = 'mcptype'
const MCP_ASSESSMENT = 'mcpassessment'

// cached results to be loaded on demand
const cache = {}

const mapping = [
  { field: 'id', dynamics: 'defra_itemid' },
  { field: 'itemName', dynamics: 'defra_name' },
  { field: 'shortName', dynamics: 'defra_shortname', encode: true },
  { field: 'code', dynamics: 'defra_code' },
  { field: 'canApplyFor', dynamics: 'defra_canapplyfor' },
  { field: 'canApplyOnline', dynamics: 'defra_canapplyonline' }
  // { field: 'displayOrder', dynamics: 'defra_displayorder' },
  // { field: 'defra_applicationline', dynamics: 'defra_applicationline' }
]

const FETCH_START = '<fetch version=\'1.0\' mapping=\'logical\' distinct=\'true\'><entity name=\'defra_item\'>' + mapping.map(({ dynamics }) => `<attribute name='${dynamics}'/>`).join('')
const FETCH_END = '</entity></fetch>'

const listItemsForDetailTypeValuesQuery = (itemType, detailType, detailValues) => {
  return `
  ${FETCH_START}
    <link-entity name='defra_itemdetail' from='defra_itemid'>
      <link-entity name='defra_itemdetailtype' to='defra_itemdetailtypeid'>
        <filter>
          <condition attribute='defra_shortname' operator='eq' value='${detailType}'/>
        </filter>
      </link-entity>
      <filter>
        <condition attribute='defra_value' operator='in'>
          ${detailValues.map((item) => `<value>${sanitiseSearchTerm(item)}</value>`).join('')}
        </condition>
      </filter>
    </link-entity>
    <link-entity name='defra_itemtype' to='defra_itemtypeid'>
      <filter>
        <condition attribute='defra_shortname' operator='eq' value='${itemType}'/>
      </filter>
    </link-entity>
  ${FETCH_END}
  `.replace(/\n\s+/g, '')
}

const listItemsQuery = (itemType) => {
  return `
  ${FETCH_START}
    <link-entity name='defra_itemtype' to='defra_itemtypeid'>
      <filter>
        <condition attribute='defra_shortname' operator='eq' value='${itemType}'/>
      </filter>
    </link-entity>
  ${FETCH_END}
  `.replace(/\n\s+/g, '')
}

const getItemQuery = (itemType, itemShortName) => {
  return `
  ${FETCH_START}
    <link-entity name='defra_itemtype' to='defra_itemtypeid'>
      <filter>
        <condition attribute='defra_shortname' operator='eq' value='${itemType}'/>
      </filter>
    </link-entity>
    <filter>
      <condition attribute='defra_shortname' operator='eq' value='${itemShortName}'/>
    </filter>
  ${FETCH_END}
  `.replace(/\n\s+/g, '')
}

// Only allow alphanumeric, hyphen and underscore in search terms
const sanitiseSearchTerm = (searchTerm) => {
  return searchTerm.replace(/^[a-z][A-Z]\d-_/g, '')
}

class Item extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_items'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return mapping
  }

  static clearCache () {
    Object.keys(cache).forEach((key) => {
      delete cache[key]
    })
  }

  static async listWasteAssessments (context) {
    cache.wasteAssessments = cache.wasteAssessments || await this.listUsingFetchXml(context, listItemsQuery(WASTE_ASSESSMENT))
    return cache.wasteAssessments
  }

  static async listWasteActivities (context) {
    cache.wasteActivities = cache.wasteActivities || await this.listUsingFetchXml(context, listItemsQuery(WASTE_ACTIVITY))
    return cache.wasteActivities
  }

  static async listWasteActivitiesForFacilityTypes (context, facilityTypes) {
    const searchValues = facilityTypes.map((item) => sanitiseSearchTerm(item))
    return this.listUsingFetchXml(context, listItemsForDetailTypeValuesQuery(WASTE_ACTIVITY, FACILITY_TYPE, searchValues))
  }

  static async getWasteActivity (context, activity) {
    const searchValue = sanitiseSearchTerm(activity)
    const results = await this.listUsingFetchXml(context, getItemQuery(WASTE_ACTIVITY, searchValue))
    return results.pop()
  }

  static async getWasteAssessment (context, assessment) {
    const searchValue = sanitiseSearchTerm(assessment)
    const results = await this.listUsingFetchXml(context, getItemQuery(WASTE_ASSESSMENT, searchValue))
    return results.pop()
  }

  static async getAllWasteActivitiesAndAssessments (context) {
    const [wasteActivities, wasteAssessments] = await Promise.all([
      Item.listWasteActivities(context),
      Item.listWasteAssessments(context)
    ])
    return { wasteActivities, wasteAssessments }
  }

  static async getAllMcpTypes (context) {
    cache.mcpItems = cache.mcpItems || await this.listUsingFetchXml(context, listItemsQuery(MCP_TYPE))
    return cache.mcpItems
  }

  static async listMcpTypesForFacilityTypes (context, facilityTypes) {
    const searchValues = facilityTypes.map((item) => sanitiseSearchTerm(item))
    return this.listUsingFetchXml(context, listItemsForDetailTypeValuesQuery(MCP_TYPE, FACILITY_TYPE, searchValues))
  }

  static async getMcpType (context, mcpType) {
    const searchValue = sanitiseSearchTerm(mcpType)
    const results = await this.listUsingFetchXml(context, getItemQuery(MCP_TYPE, searchValue))
    return results.pop()
  }

  static async getMcpAssessment (context, mcpAssessment) {
    const searchValue = sanitiseSearchTerm(mcpAssessment)
    const results = await this.listUsingFetchXml(context, getItemQuery(MCP_ASSESSMENT, searchValue))
    return results.pop()
  }
}

Item.setDefinitions()

module.exports = Item
