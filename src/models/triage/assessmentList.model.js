'use strict'

const Assessment = require('./assessment.model')
const ItemEntity = require('../../persistence/entities/item.entity')

const AssessmentList = class {
  constructor (entityContext, permitTypesArray, permitHolderTypesArray, facilityTypesArray, activitiesArray, assessmentsArray) {
    this.entityContext = entityContext
    this.permitTypesArray = permitTypesArray
    this.permitHolderTypesArray = permitHolderTypesArray
    this.facilityTypesArray = facilityTypesArray
    this.activitiesArray = activitiesArray
    this.assessmentsArray = assessmentsArray
  }

  get items () {
    return this.assessmentsArray
  }

  get ids () {
    return this.assessmentsArray.map((item) => item.id)
  }

  get canApplyOnline () {
    return this.assessmentsArray.length !== 0 && !this.assessmentsArray.find((item) => !item.canApplyOnline)
  }

  entry (id) {
    return this.assessmentsArray.find((item) => item.id === id)
  }

  getListFilteredByIds (ids) {
    const selectedItems = this.assessmentsArray.filter((item) => ids.find((id) => id === item.id))
    return new AssessmentList(this.entityContext, this.permitTypesArray, this.permitHolderTypesArray, this.facilityTypesArray, this.activitiesArray, selectedItems)
  }

  static async createList (entityContextToUse, permitTypesArray, permitHolderTypesArray, facilityTypesArray, activitiesArray, options) {
    // Currently all assessments are optional
    // const included = options ? options.includedAssessments : true
    const optional = options ? options.optionalAssessments : true

    let assessments = []

    // Only bespoke permit types have assessments
    if (permitTypesArray.find((item) => item.id === 'bespoke')) {
      // All permit holder types have the same list of assessments
      // For now, all facilities have all possible assessments
      // For now, all activities have all possible assessments as optional
      if (optional) {
        assessments = await this.getAllAssessments(entityContextToUse)
      }
    }
    return new AssessmentList(entityContextToUse, permitTypesArray, permitHolderTypesArray, facilityTypesArray, activitiesArray, assessments)
  }

  static async getAllAssessments (entityContext) {
    const allAssessmentEntities = await ItemEntity.listAssessments(entityContext)
    // Filter out any that can no longer be applied for, i.e. they should not appear to a user
    const filteredAssessmentEntities = allAssessmentEntities.filter(item => item.canApplyFor)

    return filteredAssessmentEntities.map(item => Assessment.createFromItemEntity(item))
  }
}

module.exports = AssessmentList
