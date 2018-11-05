'use strict'

const { PERMIT_TYPES, PERMIT_HOLDER_TYPE_LIST } = require('./triageLists')
const { PermitTypes } = require('../../dynamics')
const { PERMIT_HOLDER_TYPES: DYNAMICS_PERMIT_HOLDER_TYPES } = require('../../dynamics')
const KEYED_DYNAMICS_PERMIT_HOLDER_TYPES = Object.values(DYNAMICS_PERMIT_HOLDER_TYPES).reduce((acc, curr) => {
  acc[curr.id] = curr
  return acc
}, {})

const PermitType = require('./permitType.model')
const PermitHolderType = require('./permitHolderType.model')
const Activity = require('./activity.model')
const Assessment = require('./assessment.model')

const ApplicationEntity = require('../../persistence/entities/application.entity')
const ApplicationLineEntity = require('../../persistence/entities/applicationLine.entity')
const ItemEntity = require('../../persistence/entities/item.entity')
const ItemTypeEntity = require('../../persistence/entities/itemType.entity')

const setApplicationValues = async (entityContext, applicationId, values) => {
  const applicationEntity = await ApplicationEntity.getById(entityContext, applicationId)
  Object.assign(applicationEntity, values)
  return applicationEntity.save(entityContext, Object.keys(values))
}

const deleteLine = async (entityContext, lineId) => {
  const line = await ApplicationLineEntity.getById(entityContext, lineId)
  return line.delete(entityContext)
}

const createLine = async (entityContext, applicationId, itemId) => {
  const applicationLineEntity = new ApplicationLineEntity({
    applicationId,
    itemId,
    permitType: PermitTypes.BESPOKE
  })
  return applicationLineEntity.save(entityContext, ['applicationId', 'itemId', 'permitType'])
}

const createActivityLine = async (entityContext, applicationId, activityId) => {
  const activityEntity = await ItemEntity.getActivity(entityContext, activityId)
  return createLine(entityContext, applicationId, activityEntity.id)
}

const createAssessmentLine = async (entityContext, applicationId, assessmentId) => {
  const assessmentEntity = await ItemEntity.getAssessment(entityContext, assessmentId)
  return createLine(entityContext, applicationId, assessmentEntity.id)
}

module.exports = class Application {
  constructor ({ id, permitHolderType, activities, assessments }) {
    this.id = id
    this.permitHolderType = permitHolderType
    this.activities = activities
    this.assessments = assessments
    this.permitType = new PermitType(PERMIT_TYPES.BESPOKE)
  }

  setPermitHolderType (permitHolderTypeToSet) {
    this.permitHolderType = permitHolderTypeToSet
  }

  setActivities (activitiesToSet) {
    this.activities = this.activities || []

    // Set the deletion status on any existing items
    this.activities.forEach(existing => {
      if (activitiesToSet.find(item => item.id === existing.activity.id)) {
        if (existing.toBeDeleted) {
          delete existing.toBeDeleted
        }
      } else {
        existing.toBeDeleted = true
      }
    })

    // Remove any items that are flagged to be both added and deleted
    this.activities = this.activities.filter(item => !(item.toBeAdded && item.toBeDeleted))

    // Any activities not already in the list should be added as new items
    const newActivities = activitiesToSet.filter(item => !this.activities.find(existing => existing.activity.id === item.id))
    Array.prototype.push.apply(this.activities, newActivities.map((item) => ({ activity: item, toBeAdded: true })))
  }

  setAssessments (assessmentsToSet) {
    this.assessments = this.assessments || []

    // Set the deletion status on any existing items
    this.assessments.forEach(existing => {
      if (assessmentsToSet.find(item => item.id === existing.assessment.id)) {
        if (existing.toBeDeleted) {
          delete existing.toBeDeleted
        }
      } else {
        existing.toBeDeleted = true
      }
    })

    // Remove any items that are flagged to be both added and deleted
    this.assessments = this.assessments.filter(item => !(item.toBeAdded && item.toBeDeleted))

    // Any assessments not already in the list should be added as new items
    const newAssessments = assessmentsToSet.filter(item => !this.assessments.find(existing => existing.assessment.id === item.id))
    Array.prototype.push.apply(this.assessments, newAssessments.map((item) => ({ assessment: item, toBeAdded: true })))
  }

  async save (entityContextToUse) {
    this.activities = this.activities || []
    this.assessments = this.assessments || []

    const applicationValues = {}
    if (this.permitHolderType) {
      const dynamicsPermitHolderType = KEYED_DYNAMICS_PERMIT_HOLDER_TYPES[this.permitHolderType.id]
      applicationValues.applicantType = dynamicsPermitHolderType.dynamicsApplicantTypeId
      applicationValues.organisationType = dynamicsPermitHolderType.dynamicsOrganisationTypeId ? dynamicsPermitHolderType.dynamicsOrganisationTypeId : undefined
    }
    const permitHolderTypeActions = [setApplicationValues(entityContextToUse, this.id, applicationValues)]

    const activityActions = this.activities.map(item => {
      if (item.toBeDeleted) {
        return deleteLine(entityContextToUse, item.id)
      } else if (item.toBeAdded) {
        return createActivityLine(entityContextToUse, this.id, item.activity.id)
      }
    }).filter(item => item)

    const assessmentActions = this.assessments.map(item => {
      if (item.toBeDeleted) {
        return deleteLine(entityContextToUse, item.id)
      } else if (item.toBeAdded) {
        return createAssessmentLine(entityContextToUse, this.id, item.assessment.id)
      }
    }).filter(item => item)

    const allActions = permitHolderTypeActions.concat(activityActions, assessmentActions)
    await Promise.all(allActions)

    return null
  }

  static async getApplicationForId (entityContextToUse, id) {
    // Determine the permit holder type
    let permitHolderType
    const { applicantType, organisationType } = await ApplicationEntity.getById(entityContextToUse, id)
    const dynamicsPermitHolderType = Object.values(DYNAMICS_PERMIT_HOLDER_TYPES).find(({ dynamicsApplicantTypeId, dynamicsOrganisationTypeId }) => {
      return ((applicantType == null && dynamicsApplicantTypeId == null) || applicantType === dynamicsApplicantTypeId) &&
        ((organisationType == null && dynamicsOrganisationTypeId == null) || organisationType === dynamicsOrganisationTypeId)
    })
    if (dynamicsPermitHolderType) {
      const matchingPermitHolderType = PERMIT_HOLDER_TYPE_LIST.find(item => item.id === dynamicsPermitHolderType.id)
      if (matchingPermitHolderType) {
        permitHolderType = new PermitHolderType(matchingPermitHolderType)
      }
    }

    // Determine the values of all the relevant application lines
    const itemTypeEntities = await ItemTypeEntity.getActivityAndAssessmentItemTypes(entityContextToUse)
    const activityItemTypeId = itemTypeEntities.activity.id
    const assessmentItemTypeId = itemTypeEntities.assessment.id

    const itemEntities = await ItemEntity.listActivitiesAndAssessments(entityContextToUse)
    const activityItemEntities = itemEntities.filter(({ itemTypeId }) => itemTypeId === activityItemTypeId)
    const assessmentItemEntities = itemEntities.filter(({ itemTypeId }) => itemTypeId === assessmentItemTypeId)

    const applicationLineEntities = await ApplicationLineEntity.listBy(entityContextToUse, { applicationId: id })

    const activityLineEntities = applicationLineEntities.filter(({ itemId }) => activityItemEntities.find(({ id }) => id === itemId))
    const assessmentLineEntities = applicationLineEntities.filter(({ itemId }) => assessmentItemEntities.find(({ id }) => id === itemId))

    const activities = activityLineEntities.map(line => ({ id: line.id, activity: Activity.createFromItemEntity(activityItemEntities.find(({ id }) => id === line.itemId)) }))
    const assessments = assessmentLineEntities.map(line => ({ id: line.id, assessment: Assessment.createFromItemEntity(assessmentItemEntities.find(({ id }) => id === line.itemId)) }))

    return new Application({ id, permitHolderType, activities, assessments })
  }
}
