'use strict'

const ApplicationCostItem = require('./applicationCostItem.model')
const Application = require('../persistence/entities/application.entity')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const Item = require('../persistence/entities/item.entity')
const dynamicsDal = require('../services/dynamicsDal.service')
const LoggingService = require('../services/logging.service')

module.exports = class ApplicationCost {
  constructor ({ applicationCostItems, totalCostItem }) {
    this.applicationCostItems = applicationCostItems
    this.totalCostItem = totalCostItem
  }

  get items () {
    return this.applicationCostItems
  }

  get total () {
    return this.totalCostItem
  }

  static async getApplicationCostForApplicationId (entityContextToUse) {
    const { applicationId } = entityContextToUse

    const actionDataObject = {
      LineType: '910400003'
    }
    try {
      const action = `defra_applications(${applicationId})/Microsoft.Dynamics.CRM.defra_ApplicationsyncDeleteAllApplicationLinesGivenLineType`
      await dynamicsDal.callAction(action, actionDataObject)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics DeleteAllApplicationLinesGivenLineType action: ${error}`)
      throw error
    }

    try {
      const action = `defra_applications(${applicationId})/Microsoft.Dynamics.CRM.defra_ApplicationsyncCreateDiscountLines`
      await dynamicsDal.callAction(action)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics CreateDiscountLines action: ${error}`)
      throw error
    }

    const items = await Item.getAllWasteActivitiesAndAssessments(entityContextToUse)
    const wasteActivityItemEntities = items.wasteActivities
    const wasteAssessmentItemEntities = items.wasteAssessments

    const applicationLineEntities = await ApplicationLine.listBy(entityContextToUse, { applicationId })

    const wasteActivityLineEntities =
      applicationLineEntities
        .filter(({ itemId, lineType }) => wasteActivityItemEntities.find(({ id }) => {
          return id === itemId
        }))

    const wasteAssessmentLineEntities =
      applicationLineEntities
        .filter(({ itemId }) => wasteAssessmentItemEntities.find(({ id }) => {
          return id === itemId
        }))

    const wasteActivityApplicationCostItems = wasteActivityLineEntities.map((line) => {
      // CRM requires that the application line name is populated; it uses the waste activity name if none is supplied
      // This causes duplication of text so we check whether the line name matches the activity name when displaying it
      const description = line.lineName
      const cost = line.value
      const displayOrder = line.displayOrder
      return new ApplicationCostItem({ description, cost, displayOrder })
    })
    const wasteAssessmentApplicationCostItems = wasteAssessmentLineEntities.map((line) => {
      const wasteAssessment = wasteAssessmentItemEntities.find(({ id }) => id === line.itemId)
      const description = wasteAssessment.itemName
      const cost = line.value
      const displayOrder = line.displayOrder
      return new ApplicationCostItem({ description, cost, displayOrder })
    })
    const applicationCostItems = wasteActivityApplicationCostItems
      .concat(wasteAssessmentApplicationCostItems)
      .sort((a, b) => a.displayOrder - b.displayOrder)

    const applicationEntity = await Application.getById(entityContextToUse, applicationId)
    const totalCost = applicationEntity.lineItemsTotalAmount
    const totalCostItem = new ApplicationCostItem({ description: 'Total', cost: totalCost })

    return new ApplicationCost({ applicationCostItems, totalCostItem })
  }
}
