'use strict'

const DataStore = require('../models/dataStore.model')

module.exports = class WasteActivities {
  constructor (data) {
    Object.assign(this, { activities: [] }, data)
  }

  async save (context) {
    const { activities: wasteActivities } = this
    return DataStore.save(context, { wasteActivities })
  }

  includes (activities) {
    return this.activities.includes(activities)
  }

  push (activity) {
    return this.activities.push(activity)
  }

  find (fn) {
    return this.activities.find(fn)
  }

  static async get (context) {
    const { data: { wasteActivities: activities } } = await DataStore.get(context)
    if (activities) {
      return new WasteActivities({ activities })
    }
  }
}
