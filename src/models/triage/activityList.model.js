'use strict'

const Activity = require('./activity.model')
const AssessmentList = require('./assessmentList.model')
const ItemEntity = require('../../persistence/entities/item.entity')
const ItemDetailEntity = require('../../persistence/entities/itemDetail.entity')

const ActivityList = class {
  constructor (entityContext, permitTypesArray, permitHolderTypesArray, facilityTypesArray, activitiesArray) {
    this.entityContext = entityContext
    this.permitTypesArray = permitTypesArray
    this.permitHolderTypesArray = permitHolderTypesArray
    this.facilityTypesArray = facilityTypesArray
    this.activitiesArray = activitiesArray
  }

  get items () {
    return this.activitiesArray
  }

  get ids () {
    return this.activitiesArray.map((item) => item.id)
  }

  get canApplyOnline () {
    return this.activitiesArray.length !== 0 && !this.activitiesArray.find((item) => !item.canApplyOnline)
  }

  entry (id) {
    return this.activitiesArray.find((item) => item.id === id)
  }

  getListFilteredByIds (ids) {
    const selectedItems = this.activitiesArray.filter((item) => ids.find((id) => id === item.id))
    return new ActivityList(this.entityContext, this.permitTypesArray, this.permitHolderTypesArray, this.facilityTypesArray, selectedItems)
  }

  async getIncludedAssessmentList () {
    return AssessmentList.createList(this.entityContext, this.permitTypesArray, this.permitHolderTypesArray, this.facilityTypesArray, this.activitiesArray, { includedAssessments: true })
  }

  async getOptionalAssessmentList () {
    return AssessmentList.createList(this.entityContext, this.permitTypesArray, this.permitHolderTypesArray, this.facilityTypesArray, this.activitiesArray, { optionalAssessments: true })
  }

  static async createList (entityContextToUse, permitTypesArray, permitHolderTypesArray, facilityTypesArray) {
    let activities = []
    // Only bespoke permit types have activities
    if (permitTypesArray.find((item) => item.id === 'bespoke')) {
      // All permit holder types have the same list of activities
      // The relevant activities for each facility type are stored in the entities, so we have to look them up
      if (facilityTypesArray.length !== 0) {
        activities = await this.getActivitiesForFacilityTypes(entityContextToUse, facilityTypesArray)
      }
    }
    return new ActivityList(entityContextToUse, permitTypesArray, permitHolderTypesArray, facilityTypesArray, activities)
  }

  static async getActivitiesForFacilityTypes (entityContext, facilityTypes) {
    // Get the list of associated activities for each required facility type
    const activityIdLookups = facilityTypes.map(({ id }) => ItemDetailEntity.listActivitiesForFacilityType(entityContext, id))
    const allActivityEntities = await Promise.all(activityIdLookups)

    // Rationalise (merge and de-duplicate) the list of activities
    let activityEntities = [].concat.apply([], allActivityEntities)
    activityEntities = activityEntities.filter((entity, index, self) => self.findIndex(same => same.itemId === entity.itemId) === index)

    // Fetch the details of all the activities
    const activityLookups = activityEntities.map(({ itemId }) => this.getActivity(entityContext, itemId))
    const activitiesArray = await Promise.all(activityLookups)
    return activitiesArray
  }

  static async getActivity (entityContext, activityId) {
    const itemEntity = await ItemEntity.getById(entityContext, activityId)
    return Activity.createFromItemEntity(itemEntity)
  }
}

module.exports = ActivityList
