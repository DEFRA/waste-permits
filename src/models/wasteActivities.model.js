'use strict'

const ItemEntity = require('../persistence/entities/item.entity')
const DataStore = require('../models/dataStore.model')

const MAX_ENTRIES = 50

const addMatchingItemsToList = function (list, items) {
  return list.map((entry) => {
    entry.item = items.find(({ shortName }) => shortName === entry.id)
    return entry
  })
}

const createListGroupedById = function (list) {
  return list
    .reduce((groups, { id, referenceName }, index) => {
      const group = groups.find(({ groupId }) => groupId === id) || groups[groups.push({ groupId: id, members: [] }) - 1]
      group.members.push({ id, index, referenceName, order: group.members.length + 1 })
      return groups
    }, [])
}

const ungroupList = function (groupedList) {
  return groupedList
    .reduce((list, { members }) => {
      list.push(...members)
      return list
    }, [])
}

const listOfDuplicates = function (list) {
  const groupedList = createListGroupedById(list)
  const groupsWithMoreThanOneMember = groupedList.filter(({ members: { length } }) => length > 1)
  return ungroupList(groupsWithMoreThanOneMember)
}

module.exports = class WasteActivities {
  constructor (allWasteActivities, wasteActivities = []) {
    this.allWasteActivities = allWasteActivities
    this.selectedWasteActivities = wasteActivities
  }

  static async getAllWasteActivities (context) {
    return ItemEntity.listWasteActivities(context)
  }

  static async get (context) {
    const dataStore = await DataStore.get(context)
    let { wasteActivities } = dataStore.data
    if (!Array.isArray(wasteActivities)) {
      wasteActivities = []
    }
    return new WasteActivities(await WasteActivities.getAllWasteActivities(context), wasteActivities)
  }

  async save (context) {
    const dataStore = await DataStore.get(context)
    dataStore.data.wasteActivities = this.wasteActivitiesData
    await dataStore.save(context)
  }

  addWasteActivity (wasteActivityId) {
    if (!this.isFull) {
      const foundWasteActivity = this.allWasteActivities.find(({ shortName }) => shortName === wasteActivityId)
      if (foundWasteActivity) {
        const newActivity = { id: foundWasteActivity.shortName, referenceName: '' }
        // Add this item after any others of the same type
        const last = this.selectedWasteActivities.map(({ id }) => id).lastIndexOf(newActivity.id)
        const insertAt = last === -1 ? this.selectedWasteActivities.length : last + 1
        this.selectedWasteActivities.splice(insertAt, 0, newActivity)
      }
    }
  }

  deleteWasteActivity (index) {
    const selectedWasteActivity = this.selectedWasteActivities[index]
    if (selectedWasteActivity) {
      this.selectedWasteActivities.splice(index, 1)
      const duplicates = this.selectedWasteActivities.filter(({ id }) => selectedWasteActivity.id === id)
      if (duplicates.length === 1) {
        delete duplicates[0].referenceName
      }
      return selectedWasteActivity
    }
  }

  setWasteActivityReferenceName (index, referenceName) {
    const selectedWasteActivity = this.selectedWasteActivities[index]
    if (selectedWasteActivity) {
      selectedWasteActivity.referenceName = referenceName
    }
    return selectedWasteActivity
  }

  // Data in a form suitable for persisting
  get wasteActivitiesData () {
    return this.selectedWasteActivities.map(({ id, referenceName }) => ({ id, referenceName }))
  }

  // The values in a form suitable for iterating
  get wasteActivitiesValues () {
    const copy = this.selectedWasteActivities.map(({ id, referenceName }) => ({ id, referenceName }))
    return addMatchingItemsToList(copy, this.allWasteActivities)
  }

  get wasteActivitiesLength () {
    return this.selectedWasteActivities.length
  }

  get textForNumberOfWasteActivities () {
    const length = this.wasteActivitiesLength
    if (length === 0) {
      return 'no activities'
    } else if (length === 1) {
      return '1 activity'
    } else {
      return `${length} activities`
    }
  }

  get isFull () {
    return !(this.wasteActivitiesLength < MAX_ENTRIES)
  }

  get hasDuplicateWasteActivities () {
    for (let i = 0; i < this.selectedWasteActivities.length - 1; i++) {
      if (this.selectedWasteActivities[i].id === this.selectedWasteActivities[i + 1].id) {
        return true
      }
    }
    return false
  }

  get duplicateWasteActivitiesValues () {
    const duplicates = listOfDuplicates(this.selectedWasteActivities)
    return addMatchingItemsToList(duplicates, this.allWasteActivities)
  }
}
