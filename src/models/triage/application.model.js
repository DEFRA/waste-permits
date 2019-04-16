'use strict'

const { PERMIT_TYPES, PERMIT_HOLDER_TYPE_LIST } = require('./triageLists')
const { PermitTypes } = require('../../dynamics')
const { PERMIT_HOLDER_TYPES: DYNAMICS_PERMIT_HOLDER_TYPES } = require('../../dynamics')
const KEYED_DYNAMICS_PERMIT_HOLDER_TYPES = Object.values(DYNAMICS_PERMIT_HOLDER_TYPES).reduce((acc, curr) => {
  acc[curr.id] = curr
  return acc
}, {})

const TriageListItem = require('./triageListItem.model')

const ApplicationEntity = require('../../persistence/entities/application.entity')
const ApplicationLineEntity = require('../../persistence/entities/applicationLine.entity')
const ItemEntity = require('../../persistence/entities/item.entity')

const setApplicationValues = async (entityContext, values) => {
  const { applicationId } = entityContext
  const applicationEntity = await ApplicationEntity.getById(entityContext, applicationId)
  Object.assign(applicationEntity, values)
  return applicationEntity.save(entityContext, Object.keys(values))
}

const deleteLine = async (entityContext, lineId) => {
  const line = await ApplicationLineEntity.getById(entityContext, lineId)
  return line.delete(entityContext)
}

const createLine = async (entityContext, itemId) => {
  const { applicationId } = entityContext
  const applicationLineEntity = new ApplicationLineEntity({
    applicationId,
    itemId,
    permitType: PermitTypes.BESPOKE
  })
  return applicationLineEntity.save(entityContext, ['applicationId', 'itemId', 'permitType'])
}

const createWasteActivityLine = async (entityContext, wasteActivityId) => {
  const wasteActivityEntity = await ItemEntity.getWasteActivity(entityContext, wasteActivityId)
  return createLine(entityContext, wasteActivityEntity.id)
}

const createWasteAssessmentLine = async (entityContext, wasteAssessmentId) => {
  const wasteAssessmentEntity = await ItemEntity.getWasteAssessment(entityContext, wasteAssessmentId)
  return createLine(entityContext, wasteAssessmentEntity.id)
}

module.exports = class Application {
  constructor ({ id, permitHolderType, wasteActivities, wasteAssessments }) {
    this.id = id
    this.permitHolderType = permitHolderType
    this.wasteActivities = wasteActivities
    this.wasteAssessments = wasteAssessments
    this.permitType = new TriageListItem(PERMIT_TYPES.BESPOKE)
  }

  setPermitHolderType (permitHolderTypeToSet) {
    this.permitHolderType = permitHolderTypeToSet
  }

  setWasteActivities (wasteActivitiesToSet) {
    let wasteActivityLines = this.wasteActivities || []

    // Set the deletion status on any existing items
    wasteActivityLines.forEach((existing) => {
      if (wasteActivitiesToSet.find((item) => item.id === existing.wasteActivity.id)) {
        if (existing.toBeDeleted) {
          delete existing.toBeDeleted
        }
      } else {
        existing.toBeDeleted = true
      }
    })

    // Remove any items that are flagged to be both added and deleted
    wasteActivityLines = wasteActivityLines.filter((item) => !(item.toBeAdded && item.toBeDeleted))

    // Any activities not already in the list should be added as new items
    const newWasteActivities = wasteActivitiesToSet.filter((item) => !wasteActivityLines.find((existing) => existing.wasteActivity.id === item.id))
    const wasteActivitiesToBeAdded = newWasteActivities.map((item) => ({ wasteActivity: item, toBeAdded: true }))
    wasteActivityLines = wasteActivityLines.concat(wasteActivitiesToBeAdded)

    this.wasteActivities = wasteActivityLines
  }

  setWasteAssessments (wasteAssessmentsToSet) {
    let wasteAssessmentLines = this.wasteAssessments || []

    // Set the deletion status on any existing items
    wasteAssessmentLines.forEach((existing) => {
      if (wasteAssessmentsToSet.find((item) => item.id === existing.wasteAssessment.id)) {
        if (existing.toBeDeleted) {
          delete existing.toBeDeleted
        }
      } else {
        existing.toBeDeleted = true
      }
    })

    // Remove any items that are flagged to be both added and deleted
    wasteAssessmentLines = wasteAssessmentLines.filter((item) => !(item.toBeAdded && item.toBeDeleted))

    // Any assessments not already in the list should be added as new items
    const newWasteAssessments = wasteAssessmentsToSet.filter((item) => !wasteAssessmentLines.find((existing) => existing.wasteAssessment.id === item.id))
    const wasteAssessmentsToBeAdded = newWasteAssessments.map((item) => ({ wasteAssessment: item, toBeAdded: true }))
    wasteAssessmentLines = wasteAssessmentLines.concat(wasteAssessmentsToBeAdded)

    this.wasteAssessments = wasteAssessmentLines
  }

  async save (entityContextToUse) {
    // This method previously performed all of its operations in parallel but this caused the total cost
    // to be calculated incorrectly due to a race condition.
    // So now each operation is individually awaited.

    const permitHolderType = this.permitHolderType
    const wasteActivities = this.wasteActivities || []
    const wasteAssessments = this.wasteAssessments || []

    const applicationValues = {}
    if (permitHolderType) {
      const dynamicsPermitHolderType = KEYED_DYNAMICS_PERMIT_HOLDER_TYPES[permitHolderType.id]
      applicationValues.applicantType = dynamicsPermitHolderType.dynamicsApplicantTypeId
      applicationValues.organisationType = dynamicsPermitHolderType.dynamicsOrganisationTypeId ? dynamicsPermitHolderType.dynamicsOrganisationTypeId : undefined
    }
    await setApplicationValues(entityContextToUse, applicationValues)

    for (const item of wasteActivities) {
      if (item.toBeDeleted) {
        await deleteLine(entityContextToUse, item.id)
      } else if (item.toBeAdded) {
        await createWasteActivityLine(entityContextToUse, item.wasteActivity.id)
      }
    }

    for (const item of wasteAssessments) {
      if (item.toBeDeleted) {
        await deleteLine(entityContextToUse, item.id)
      } else if (item.toBeAdded) {
        await createWasteAssessmentLine(entityContextToUse, item.wasteAssessment.id)
      }
    }

    return null
  }

  static async getApplicationForId (entityContextToUse) {
    const { applicationId } = entityContextToUse

    // Determine the permit holder type
    const permitHolderType = await this.getPermitHolderTypeForApplicationId(entityContextToUse, applicationId)

    const itemEntities = await ItemEntity.getAllWasteActivitiesAndAssessments(entityContextToUse)
    const wasteActivityItemEntities = itemEntities.wasteActivities
    const wasteAssessmentItemEntities = itemEntities.wasteAssessments

    const applicationLineEntities = await ApplicationLineEntity.listBy(entityContextToUse, { applicationId })

    const wasteActivityLineEntities = applicationLineEntities.filter(({ itemId }) => wasteActivityItemEntities.find(({ id }) => id === itemId))
    const wasteAssessmentLineEntities = applicationLineEntities.filter(({ itemId }) => wasteAssessmentItemEntities.find(({ id }) => id === itemId))

    const wasteActivities = wasteActivityLineEntities.map((line) => ({ id: line.id, wasteActivity: TriageListItem.createWasteActivityFromItemEntity(wasteActivityItemEntities.find(({ id }) => id === line.itemId)) }))
    const wasteAssessments = wasteAssessmentLineEntities.map((line) => ({ id: line.id, wasteAssessment: TriageListItem.createWasteAssessmentFromItemEntity(wasteAssessmentItemEntities.find(({ id }) => id === line.itemId)) }))

    return new Application({ id: applicationId, permitHolderType, wasteActivities, wasteAssessments })
  }

  static async getPermitHolderTypeForApplicationId (entityContextToUse) {
    let permitHolderType

    const { applicationId } = entityContextToUse
    const { applicantType, organisationType } = await ApplicationEntity.getById(entityContextToUse, applicationId)

    const dynamicsPermitHolderType = Object.values(DYNAMICS_PERMIT_HOLDER_TYPES).find(({ dynamicsApplicantTypeId, dynamicsOrganisationTypeId }) => {
      return ((applicantType == null && dynamicsApplicantTypeId == null) || applicantType === dynamicsApplicantTypeId) &&
        ((organisationType == null && dynamicsOrganisationTypeId == null) || organisationType === dynamicsOrganisationTypeId)
    })

    if (dynamicsPermitHolderType) {
      const matchingPermitHolderType = PERMIT_HOLDER_TYPE_LIST.find((item) => item.id === dynamicsPermitHolderType.id)
      if (matchingPermitHolderType) {
        permitHolderType = new TriageListItem(matchingPermitHolderType)
      }
    }

    return permitHolderType
  }
}
