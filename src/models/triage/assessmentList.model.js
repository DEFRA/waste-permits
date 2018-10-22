'use strict'

const { ASSESSMENTS } = require('./triageLists')
const Assessment = require('./assessment.model')

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
    const included = options ? options.includedAssessments : true
    const optional = options ? options.optionalAssessments : true

    let assessments = []

    // Only bespoke permit types have assessments
    if (permitTypesArray.find((item) => item.id === 'bespoke')) {
      // All permit holder types have the same list of assessments
      // For now, all facilities have all possible assessments
      // TODO - Ben Sagar - Work out which assessments apply to which facilities and activities
      // For now, hard-coding some assessment/activity combinations
      const activity1 = activitiesArray.find((item) => item.id === 'activity-1')
      const activity2 = activitiesArray.find((item) => item.id === 'activity-2')
      if (activity1 && activity2) {
        assessments = AssessmentList.createDummyAssessmentsForActivities1And2(included, optional)
      } else if (activity1) {
        assessments = AssessmentList.createDummyAssessmentsForActivity1(included, optional)
      } else if (activity2) {
        assessments = AssessmentList.createDummyAssessmentsForActivity2(included, optional)
      }
    }
    return new AssessmentList(entityContextToUse, permitTypesArray, permitHolderTypesArray, facilityTypesArray, activitiesArray, assessments)
  }

  static createDummyAssessmentsForActivity1 (included, optional) {
    let assessments = []
    if (included) {
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT1))
    }
    if (optional) {
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT3))
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT4))
    }

    return assessments
  }

  static createDummyAssessmentsForActivity2 (included, optional) {
    let assessments = []
    if (included) {
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT2))
    }
    if (optional) {
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT4))
    }

    return assessments
  }

  static createDummyAssessmentsForActivities1And2 (included, optional) {
    let assessments = []
    if (included) {
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT1))
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT2))
    }
    if (optional) {
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT3))
      assessments.push(new Assessment(ASSESSMENTS.ASSESSMENT4))
    }

    return assessments
  }
}

module.exports = AssessmentList
