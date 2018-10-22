'use strict'

const { PERMIT_TYPE_LIST } = require('./triageLists')
const PermitType = require('./permitType.model')
const PermitHolderTypeList = require('./permitHolderTypeList.model')

class PermitTypeList {
  constructor (entityContext, permitTypesArray) {
    this.entityContext = entityContext
    this.permitTypesArray = permitTypesArray
  }

  get items () {
    return this.permitTypesArray
  }

  get ids () {
    return this.permitTypesArray.map((item) => item.id)
  }

  get canApplyOnline () {
    return this.permitTypesArray.length !== 0 && !this.permitTypesArray.find((item) => !item.canApplyOnline)
  }

  entry (id) {
    return this.permitTypesArray.find((item) => item.id === id)
  }

  getListFilteredByIds (ids) {
    const selectedItems = this.permitTypesArray.filter((item) => ids.find((id) => id === item.id))
    return new PermitTypeList(this.entityContext, selectedItems)
  }

  setSelectedByIds (ids) {
    this.permitTypesArray.forEach((item) => {
      if (ids.find((id) => id === item.id)) {
        item.isSelected = true
      }
    })
  }

  async getPermitHolderTypeList () {
    return PermitHolderTypeList.createList(this.entityContext, this.permitTypesArray)
  }

  static async getListOfAllPermitTypes (entityContextToUse) {
    const permitTypes = []
    PERMIT_TYPE_LIST.forEach((permitType) => permitTypes.push(new PermitType(permitType)))
    return new PermitTypeList(entityContextToUse, permitTypes)
  }
}

module.exports = PermitTypeList
