'use strict'

const BaseEntity = require('./base.entity')
const DynamicsDalService = require('../../services/dynamicsDal.service')
const LoggingService = require('../../services/logging.service')

const ACTIVITY = 'wasteactivity'
const ASSESSMENT = 'wasteassessment'
const FACILITY_TYPE = 'facilitytype'

const mapping = [
  { field: 'id', dynamics: 'defra_itemid' },
  { field: 'itemName', dynamics: 'defra_name' },
  { field: 'shortName', dynamics: 'defra_shortname', encode: true },
  { field: 'code', dynamics: 'defra_code' },
  { field: 'canApplyFor', dynamics: 'defra_canapplyfor' },
  { field: 'canApplyOnline', dynamics: 'defra_canapplyonline' }
]

const linkEntityFromFieldStartTag = (entityName, fieldName) => `<link-entity name='${entityName}' from='${fieldName}'>`
const linkEntityToFieldStartTag = (entityName, fieldName) => `<link-entity name='${entityName}' to='${fieldName}'>`
const LINK_ENTITY_END_TAG = '</link-entity>'

const queryByShortNameTag = (shortNameValue) => `<filter><condition attribute='defra_shortname' operator='eq' value='${shortNameValue}'/></filter>`
const QUERY_BY_VALUE_START_TAG = `<filter><condition attribute='defra_value' operator='in'>`
const QUERY_BY_VALUE_END_TAG = '</condition></filter>'
const VALUE_START_TAG = '<value>'
const VALUE_END_TAG = '</value>'

const LINK_ITEM_TYPE_ENTITY = linkEntityToFieldStartTag('defra_itemtype', 'defra_itemtypeid')
const LINK_ITEM_DETAIL_ENTITY = linkEntityFromFieldStartTag('defra_itemdetail', 'defra_itemid')
const LINK_ITEM_DETAIL_TYPE_ENTITY = linkEntityToFieldStartTag('defra_itemdetailtype', 'defra_itemdetailtypeid')

const IS_ACTIVITY = LINK_ITEM_TYPE_ENTITY + queryByShortNameTag(ACTIVITY) + LINK_ENTITY_END_TAG
const IS_ASSESSMENT = LINK_ITEM_TYPE_ENTITY + queryByShortNameTag(ASSESSMENT) + LINK_ENTITY_END_TAG
const IS_FACILITY_TYPE = LINK_ITEM_DETAIL_TYPE_ENTITY + queryByShortNameTag(FACILITY_TYPE) + LINK_ENTITY_END_TAG

const FETCH_PREFIX = `<fetch version='1.0' mapping='logical' distinct='true'><entity name='defra_item'>` + mapping.map(({ dynamics }) => `<attribute name='${dynamics}'/>`).join('')
const FETCH_SUFFIX = '</entity></fetch>'

const FETCH_ALL_ACTIVITIES = FETCH_PREFIX + IS_ACTIVITY + FETCH_SUFFIX
const FETCH_ALL_ASSESSMENTS = FETCH_PREFIX + IS_ASSESSMENT + FETCH_SUFFIX
const FETCH_ACTIVITIES_FOR_FACILITY_TYPES_PREFIX = FETCH_PREFIX + LINK_ITEM_DETAIL_ENTITY + IS_FACILITY_TYPE + QUERY_BY_VALUE_START_TAG
const FETCH_ACTIVITIES_FOR_FACILITY_TYPES_SUFFIX = QUERY_BY_VALUE_END_TAG + LINK_ENTITY_END_TAG + FETCH_SUFFIX
const FETCH_AN_ACTIVITY_PREFIX = FETCH_PREFIX + IS_ACTIVITY
const FETCH_AN_ACTIVITY_SUFFIX = FETCH_SUFFIX
const FETCH_AN_ASSESSMENT_PREFIX = FETCH_PREFIX + IS_ASSESSMENT
const FETCH_AN_ASSESSMENT_SUFFIX = FETCH_SUFFIX

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

  static async listUsingFetchXml (context, query) {
    const dynamicsDal = new DynamicsDalService(context.authToken)
    try {
      const response = await dynamicsDal.search(`${this.dynamicsEntity}?fetchXml=${encodeURIComponent(query)}`)
      return response.value.map((item) => this.dynamicsToEntity(item))
    } catch (error) {
      LoggingService.logError(`Unable to retrieve ${this.name} using FetchXml: ${error}`)
      throw error
    }
  }

  static async listAssessments (context) {
    return this.listUsingFetchXml(context, FETCH_ALL_ASSESSMENTS)
  }

  static async listActivitiesForFacilityTypes (context, facilityTypes) {
    const searchValues = facilityTypes.map((item) => `${VALUE_START_TAG}${sanitiseSearchTerm(item)}${VALUE_END_TAG}`).join('')
    return this.listUsingFetchXml(context, `${FETCH_ACTIVITIES_FOR_FACILITY_TYPES_PREFIX}${searchValues}${FETCH_ACTIVITIES_FOR_FACILITY_TYPES_SUFFIX}`)
  }

  static async getActivity (context, activity) {
    const searchValue = sanitiseSearchTerm(activity)
    const query = FETCH_AN_ACTIVITY_PREFIX + queryByShortNameTag(searchValue) + FETCH_AN_ACTIVITY_SUFFIX
    const results = await this.listUsingFetchXml(context, query)
    return results.pop()
  }

  static async getAssessment (context, assessment) {
    const searchValue = sanitiseSearchTerm(assessment)
    const query = FETCH_AN_ASSESSMENT_PREFIX + queryByShortNameTag(searchValue) + FETCH_AN_ASSESSMENT_SUFFIX
    const results = await this.listUsingFetchXml(context, query)
    return results.pop()
  }

  static async getAllActivitiesAndAssessments (context) {
    return {
      activities: await this.listUsingFetchXml(context, FETCH_ALL_ACTIVITIES),
      assessments: await this.listUsingFetchXml(context, FETCH_ALL_ASSESSMENTS)
    }
  }
}

Item.setDefinitions()

module.exports = Item
