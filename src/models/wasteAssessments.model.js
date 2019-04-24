'use strict'

const DataStore = require('../models/dataStore.model')

module.exports = class WasteAssessments {
  constructor (data) {
    Object.assign(this, { assessments: [] }, data)
  }

  async save (context) {
    const { assessments: wasteAssessments } = this
    return DataStore.save(context, { wasteAssessments })
  }

  includes (assessments) {
    return this.assessments.includes(assessments)
  }

  push (assessment) {
    return this.assessments.push(assessment)
  }

  find (fn) {
    return this.assessments.find(fn)
  }

  static async get (context) {
    const { data: { wasteAssessments: assessments } } = await DataStore.get(context)
    if (assessments) {
      return new WasteAssessments({ assessments })
    }
  }
}
