'use strict'

const { FACILITY_TYPE_LIST } = require('./triageLists')
const FacilityType = require('./facilityType.model')
const ActivityList = require('./activityList.model')

const FacilityTypeList = class {
  constructor (entityContext, permitTypesArray, permitHolderTypesArray, facilityTypesArray) {
    this.entityContext = entityContext
    this.permitTypesArray = permitTypesArray
    this.permitHolderTypesArray = permitHolderTypesArray
    this.facilityTypesArray = facilityTypesArray
  }

  get items () {
    return this.facilityTypesArray
  }

  get ids () {
    return this.facilityTypesArray.map((item) => item.id)
  }

  get canApplyOnline () {
    return this.facilityTypesArray.length !== 0 && !this.facilityTypesArray.find((item) => !item.canApplyOnline)
  }

  get typeText () {
    const list = this.facilityTypesArray.map(item => item.typeText)
    const retval = list.slice(0, -2).join(', ') + (list.slice(0, -2).length ? ', ' : '') + list.slice(-2).join(' and ')
    return retval
  }

  entry (id) {
    return this.facilityTypesArray.find((item) => item.id === id)
  }

  getListFilteredByIds (ids) {
    const selectedItems = this.facilityTypesArray.filter((item) => ids.find((id) => id === item.id))
    return new FacilityTypeList(this.entityContext, this.permitTypesArray, this.permitHolderTypesArray, selectedItems)
  }

  async getActivityList () {
    return ActivityList.createList(this.entityContext, this.permitTypesArray, this.permitHolderTypesArray, this.facilityTypesArray)
  }

  static async createList (entityContextToUse, permitTypesArray, permitHolderTypesArray) {
    let facilityTypes = []
    // Only bespoke permit types have facilities
    if (permitTypesArray.find((item) => item.id === 'bespoke')) {
      // All permit holder types have the same list of facility types
      FACILITY_TYPE_LIST.forEach((facilityType) => facilityTypes.push(new FacilityType(facilityType)))
    }
    return new FacilityTypeList(entityContextToUse, permitTypesArray, permitHolderTypesArray, facilityTypes)
  }
}

module.exports = FacilityTypeList
