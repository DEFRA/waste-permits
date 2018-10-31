'use strict'

const { PERMIT_HOLDER_TYPE_LIST } = require('./triageLists')
const PermitHolderType = require('./permitHolderType.model')
const FacilityTypeList = require('./facilityTypeList.model')

const PermitHolderTypeList = class {
  constructor (entityContext, permitTypesArray, permitHolderTypesArray) {
    this.entityContext = entityContext
    this.permitTypesArray = permitTypesArray
    this.permitHolderTypesArray = permitHolderTypesArray
  }

  get items () {
    return this.permitHolderTypesArray
  }

  get ids () {
    return this.permitHolderTypesArray.map((item) => item.id)
  }

  get canApplyOnline () {
    return this.permitHolderTypesArray.length !== 0 && !this.permitHolderTypesArray.find((item) => !item.canApplyOnline)
  }

  entry (id) {
    return this.permitHolderTypesArray.find((item) => item.id === id)
  }

  getListFilteredByIds (ids) {
    const selectedItems = this.permitHolderTypesArray.filter((item) => ids.find((id) => id === item.id))
    return new PermitHolderTypeList(this.entityContext, this.permitTypesArray, selectedItems)
  }

  async getFacilityTypeList () {
    return FacilityTypeList.createList(this.entityContext, this.permitTypesArray, this.permitHolderTypesArray)
  }

  static async createList (entityContextToUse, permitTypesArray) {
    // All permit types have the same, full list of permit holder types
    const permitHolderTypesArray = PERMIT_HOLDER_TYPE_LIST.map(item => new PermitHolderType(item))
    return new PermitHolderTypeList(entityContextToUse, permitTypesArray, permitHolderTypesArray)
  }
}

module.exports = PermitHolderTypeList
