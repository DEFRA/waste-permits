'use strict'

module.exports = class ApplicationCostItem {
  constructor ({ activity, assessment, description, cost }) {
    this.activity = activity
    this.assessment = assessment
    this.description = description
    this.cost = cost
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
