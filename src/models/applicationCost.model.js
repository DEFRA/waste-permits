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

    try {
      const action = `defra_applications(${applicationId})/Microsoft.Dynamics.CRM.defra_ApplicationsyncCreateDiscountLines`
      await dynamicsDal.callAction(action)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics Set Application Answer action: ${error}`)
      throw error
    }

    const items = await Item.getAllWasteActivitiesAndAssessments(entityContextToUse)
    const wasteActivityItemEntities = items.wasteActivities
    const wasteAssessmentItemEntities = items.wasteAssessments

    const applicationLineEntities = await ApplicationLine.listBy(entityContextToUse, { applicationId })
    console.log(applicationLineEntities)
    const wasteActivityLineEntities =
      applicationLineEntities
        .filter(({ itemId }) => wasteActivityItemEntities.find(({ id }) => id === itemId))
    console.log(wasteActivityLineEntities)
    const wasteAssessmentLineEntities =
      applicationLineEntities
        .filter(({ itemId }) => wasteAssessmentItemEntities.find(({ id }) => id === itemId))
    console.log(wasteAssessmentItemEntities)

    const wasteActivityApplicationCostItems = wasteActivityLineEntities.map((line) => {
      const wasteActivity = wasteActivityItemEntities.find(({ id }) => id === line.itemId)
      const description = wasteActivity.itemName + (line.lineName ? ` ${line.lineName}` : '')
      const cost = line.value
      return new ApplicationCostItem({ description, cost })
    })
    const wasteAssessmentApplicationCostItems = wasteAssessmentLineEntities.map((line) => {
      const wasteAssessment = wasteAssessmentItemEntities.find(({ id }) => id === line.itemId)
      const description = wasteAssessment.itemName
      const cost = line.value
      return new ApplicationCostItem({ description, cost })
    })
    const applicationCostItems = wasteActivityApplicationCostItems.concat(wasteAssessmentApplicationCostItems)

    const applicationEntity = await Application.getById(entityContextToUse, applicationId)
    const totalCost = applicationEntity.lineItemsTotalAmount
    const totalCostItem = new ApplicationCostItem({ description: 'Total', cost: totalCost })

    return new ApplicationCost({ applicationCostItems, totalCostItem })
  }
}
