'use strict'

const ApplicationCostItem = require('./applicationCostItem.model')

const Activity = require('./activity.model')
const Assessment = require('./assessment.model')

const ApplicationEntity = require('../../persistence/entities/application.entity')
const ApplicationLineEntity = require('../../persistence/entities/applicationLine.entity')
const ItemEntity = require('../../persistence/entities/item.entity')

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

  static async getApplicationCostForApplicationId (entityContextToUse, id) {
    const itemEntities = await ItemEntity.getAllActivitiesAndAssessments(entityContextToUse)
    const activityItemEntities = itemEntities.activities
    const assessmentItemEntities = itemEntities.assessments

    const applicationLineEntities = await ApplicationLineEntity.listBy(entityContextToUse, { applicationId: id })
    const activityLineEntities = applicationLineEntities.filter(({ itemId }) => activityItemEntities.find(({ id }) => id === itemId))
    const assessmentLineEntities = applicationLineEntities.filter(({ itemId }) => assessmentItemEntities.find(({ id }) => id === itemId))

    const activityApplicationCostItems = activityLineEntities.map((line) => {
      const activity = Activity.createFromItemEntity(activityItemEntities.find(({ id }) => id === line.itemId))
      const description = activity.text
      const cost = line.value
      return new ApplicationCostItem({ activity, description, cost })
    })
    const assessmentApplicationCostItems = assessmentLineEntities.map((line) => {
      const assessment = Assessment.createFromItemEntity(assessmentItemEntities.find(({ id }) => id === line.itemId))
      const description = assessment.text
      const cost = line.value
      return new ApplicationCostItem({ assessment, description, cost })
    })
    const applicationCostItems = activityApplicationCostItems.concat(assessmentApplicationCostItems)

    const applicationEntity = await ApplicationEntity.getById(entityContextToUse, id)
    const totalCost = applicationEntity.lineItemsTotalAmount
    const totalCostItem = new ApplicationCostItem({ description: 'Total', cost: totalCost })

    return new ApplicationCost({ applicationCostItems, totalCostItem })
  }
}
