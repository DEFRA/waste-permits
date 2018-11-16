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
    let activityLines = this.activities || []

    // Set the deletion status on any existing items
    activityLines.forEach((existing) => {
      if (activitiesToSet.find((item) => item.id === existing.activity.id)) {
        if (existing.toBeDeleted) {
          delete existing.toBeDeleted
        }
      } else {
        existing.toBeDeleted = true
      }
    })

    // Remove any items that are flagged to be both added and deleted
    activityLines = activityLines.filter((item) => !(item.toBeAdded && item.toBeDeleted))

    // Any activities not already in the list should be added as new items
    const newActivities = activitiesToSet.filter((item) => !activityLines.find((existing) => existing.activity.id === item.id))
    const activitiesToBeAdded = newActivities.map((item) => ({ activity: item, toBeAdded: true }))
    activityLines = activityLines.concat(activitiesToBeAdded)

    this.activities = activityLines
  }

  setAssessments (assessmentsToSet) {
    let assessmentLines = this.assessments || []

    // Set the deletion status on any existing items
    assessmentLines.forEach((existing) => {
      if (assessmentsToSet.find((item) => item.id === existing.assessment.id)) {
        if (existing.toBeDeleted) {
          delete existing.toBeDeleted
        }
      } else {
        existing.toBeDeleted = true
      }
    })

    // Remove any items that are flagged to be both added and deleted
    assessmentLines = assessmentLines.filter((item) => !(item.toBeAdded && item.toBeDeleted))

    // Any assessments not already in the list should be added as new items
    const newAssessments = assessmentsToSet.filter((item) => !assessmentLines.find((existing) => existing.assessment.id === item.id))
    const assessmentsToBeAdded = newAssessments.map((item) => ({ assessment: item, toBeAdded: true }))
    assessmentLines = assessmentLines.concat(assessmentsToBeAdded)

    this.assessments = assessmentLines
  }

  async save (entityContextToUse) {
    const id = this.id
    const permitHolderType = this.permitHolderType
    const activities = this.activities || []
    const assessments = this.assessments || []

    const applicationValues = {}
    if (permitHolderType) {
      const dynamicsPermitHolderType = KEYED_DYNAMICS_PERMIT_HOLDER_TYPES[permitHolderType.id]
      applicationValues.applicantType = dynamicsPermitHolderType.dynamicsApplicantTypeId
      applicationValues.organisationType = dynamicsPermitHolderType.dynamicsOrganisationTypeId ? dynamicsPermitHolderType.dynamicsOrganisationTypeId : undefined
    }
    const permitHolderTypeActions = [setApplicationValues(entityContextToUse, id, applicationValues)]

    const activityActions = activities.map((item) => {
      if (item.toBeDeleted) {
        return deleteLine(entityContextToUse, item.id)
      } else if (item.toBeAdded) {
        return createActivityLine(entityContextToUse, id, item.activity.id)
      }
    }).filter((item) => item)

    const assessmentActions = assessments.map((item) => {
      if (item.toBeDeleted) {
        return deleteLine(entityContextToUse, item.id)
      } else if (item.toBeAdded) {
        return createAssessmentLine(entityContextToUse, id, item.assessment.id)
      }
    }).filter((item) => item)

    const allActions = permitHolderTypeActions.concat(activityActions, assessmentActions)
    await Promise.all(allActions)

    return null
  }

  static async getApplicationForId (entityContextToUse, id) {
    // Determine the permit holder type
    const permitHolderType = await this.getPermitHolderTypeForApplicationId(entityContextToUse, id)

    const itemEntities = await ItemEntity.getAllActivitiesAndAssessments(entityContextToUse)
    const activityItemEntities = itemEntities.activities
    const assessmentItemEntities = itemEntities.assessments

    const applicationLineEntities = await ApplicationLineEntity.listBy(entityContextToUse, { applicationId: id })

    const activityLineEntities = applicationLineEntities.filter(({ itemId }) => activityItemEntities.find(({ id }) => id === itemId))
    const assessmentLineEntities = applicationLineEntities.filter(({ itemId }) => assessmentItemEntities.find(({ id }) => id === itemId))

    const activities = activityLineEntities.map((line) => ({ id: line.id, activity: Activity.createFromItemEntity(activityItemEntities.find(({ id }) => id === line.itemId)) }))
    const assessments = assessmentLineEntities.map((line) => ({ id: line.id, assessment: Assessment.createFromItemEntity(assessmentItemEntities.find(({ id }) => id === line.itemId)) }))

    return new Application({ id, permitHolderType, activities, assessments })
  }

  static async getPermitHolderTypeForApplicationId (entityContextToUse, applicationId) {
    let permitHolderType

    const { applicantType, organisationType } = await ApplicationEntity.getById(entityContextToUse, applicationId)

    const dynamicsPermitHolderType = Object.values(DYNAMICS_PERMIT_HOLDER_TYPES).find(({ dynamicsApplicantTypeId, dynamicsOrganisationTypeId }) => {
      return ((applicantType == null && dynamicsApplicantTypeId == null) || applicantType === dynamicsApplicantTypeId) &&
        ((organisationType == null && dynamicsOrganisationTypeId == null) || organisationType === dynamicsOrganisationTypeId)
    })

    if (dynamicsPermitHolderType) {
      const matchingPermitHolderType = PERMIT_HOLDER_TYPE_LIST.find((item) => item.id === dynamicsPermitHolderType.id)
      if (matchingPermitHolderType) {
        permitHolderType = new PermitHolderType(matchingPermitHolderType)
      }
    }

    return permitHolderType
  }
}
