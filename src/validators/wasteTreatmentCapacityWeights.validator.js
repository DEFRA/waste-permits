'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const { treatmentAnswers } = require('../models/wasteTreatmentCapacity.model.js')
const MAX_LENGTH = 15

module.exports = class WasteTreatmentCapacityWeightValidator extends BaseValidator {
  get errorMessages () {
    /*
    return {
      'waste-weight': {
        'custom.invalid': '',
        'any.required': 'You must enter a number/weight for each waste type',
        'string.max': `You can enter up to ${MAX_LENGTH} characters`,
        'number.base': 'Weights must be numbers',
        'number.unsafe': `Enter the weights between 0 and 999999999999999`
      }
    } */
    const obj = {}
    treatmentAnswers.forEach(ans => {
      obj[ans.weightCode] = {
        'custom.invalid': 'whaaa'
      }
    })
    return obj
  }
  /*
  get formValidators () {
    return {
      'waste-weight': Joi.number().max(MAX_LENGTH).required()
    }
  }
*/
  // TODO: loop on the model add one of these each and compare!
  get customValidators () {
    const obj = {}
    treatmentAnswers.forEach(ans => {
      obj[ans.weightCode] = {
        'custom.invalid': (...value) => {
          // console.log(treatmentAnswers)
          console.log(`###### ${ans.weightCode}`, value)
          return true
        }
      }
    })
    return obj
    /*
    return {
      'waste-weight': {
        'custom.invalid': (...value) => {
          console.log(treatmentAnswers)
          console.log('######', value)
          return true
        }
      }
    }
    */
  }
}
