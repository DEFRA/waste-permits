'use strict'

const { MULTIPLE_ACTIVITY } = require('../dynamics').DiscountTypes

module.exports = class ApplicationCostItem {
  constructor ({ wasteActivity, wasteAssessment, description, cost, displayOrder, discountType }) {
    this.wasteActivity = wasteActivity
    this.wasteAssessment = wasteAssessment
    this.description = description
    this.cost = cost
    this.displayOrder = displayOrder
    this.discountType = discountType
  }

  get isMultipleActivity () {
    return this.discountType === MULTIPLE_ACTIVITY
  }

  get costValue () {
    if (typeof this.cost === 'number') {
      return this.cost
    } else {
      return 0
    }
  }

  get costText () {
    if (typeof this.cost === 'number') {
      if (this.cost === 0) {
        return 'Cost included in application'
      } else {
        return this.cost.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })
      }
    } else {
      return this.cost
    }
  }
}
