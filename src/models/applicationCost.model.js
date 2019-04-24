'use strict'

const ApplicationCostItem = require('./applicationCostItem.model')
const ApplicationEntity = require('../persistence/entities/application.entity')
const ApplicationLineEntity = require('../persistence/entities/applicationLine.entity')
const ItemEntity = require('../persistence/entities/item.entity')

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
    const itemEntities = await ItemEntity.getAllWasteActivitiesAndAssessments(entityContextToUse)
    const wasteActivityItemEntities = itemEntities.wasteActivities
    const wasteAssessmentItemEntities = itemEntities.wasteAssessments

    const applicationLineEntities = await ApplicationLineEntity.listBy(entityContextToUse, { applicationId })
    const wasteActivityLineEntities = applicationLineEntities.filter(({ itemId }) => wasteActivityItemEntities.find(({ id }) => id === itemId))
    const wasteAssessmentLineEntities = applicationLineEntities.filter(({ itemId }) => wasteAssessmentItemEntities.find(({ id }) => id === itemId))

    const wasteActivityApplicationCostItems = wasteActivityLineEntities.map((line) => {
      const wasteActivity = wasteActivityItemEntities.find(({ id }) => id === line.itemId)
      const description = wasteActivity.itemName
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

    const applicationEntity = await ApplicationEntity.getById(entityContextToUse, applicationId)
    const totalCost = applicationEntity.lineItemsTotalAmount
    const totalCostItem = new ApplicationCostItem({ description: 'Total', cost: totalCost })

    return new ApplicationCost({ applicationCostItems, totalCostItem })
  }
}
