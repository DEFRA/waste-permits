'use strict'

const DataStore = require('../models/dataStore.model')
const { FACILITY_TYPES } = require('../dynamics')

const facilityTypes = Object.values(FACILITY_TYPES)

module.exports = class FacilityType {
  constructor (data) {
    Object.assign(this, data)
  }

  async save (context) {
    const { id: facilityType } = this
    return DataStore.save(context, { facilityType })
  }

  static async get (context) {
    const { data: { facilityType: facilityTypeId } } = await DataStore.get(context)
    const facilityType = facilityTypes.find(({ id }) => id === facilityTypeId)
    if (facilityType) {
      return new FacilityType(facilityType)
    }
  }
}
