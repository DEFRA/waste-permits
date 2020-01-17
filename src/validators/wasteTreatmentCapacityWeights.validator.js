'use strict'

const BaseValidator = require('./base.validator')
const { treatmentAnswers } = require('../models/wasteTreatmentCapacity.model.js')

module.exports = class WasteTreatmentCapacityWeightValidator extends BaseValidator {
  get errorMessages () {
    const obj = {}
    treatmentAnswers.forEach(ans => {
      obj[ans.weightCode] = {
        'custom-invalid': ans.questionText + ' must be a number between 1 and 999999999999999'
      }
    })
    return obj
  }
  get customValidators () {
    const obj = {}
    treatmentAnswers.forEach(ans => {
      obj[ans.weightCode] = {
        'custom-invalid': (...value) => {
          const numVal = Number(value[0])
          if (Object.keys(value[1]).indexOf(ans.weightCode) >= 0) {
            return Number.isNaN(numVal) || numVal <= 0 || numVal > 999999999999999
          }
        }
      }
    })
    return obj
  }
}
