'use strict'

const BaseValidator = require('./base.validator')
const { treatmentAnswers } = require('../models/wasteTreatmentCapacity.model.js')

module.exports = class WasteTreatmentCapacityWeightValidator extends BaseValidator {
  get errorMessages () {
    const obj = {}
    treatmentAnswers.forEach(ans => {
      obj[ans.weightTreatmentCode] = {
        'custom-invalid': 'You must enter a valid value'
      }
    })
    return obj
  }
  get customValidators () {
    const obj = {}
    treatmentAnswers.forEach(ans => {
      obj[ans.weightTreatmentCode] = {
        'custom-invalid': (...value) => {
          const numVal = Number.parseInt(value[0])
          if (Object.keys(value[1]).indexOf(ans.weightTreatmentCode) >= 0) {
            return Number.isNaN(numVal) || numVal <= 0 || numVal > 999999999999999
          }
        }
      }
    })
    return obj
  }
}
