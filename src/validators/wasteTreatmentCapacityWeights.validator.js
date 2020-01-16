'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const MAX_LENGTH = 15

module.exports = class WasteTreatmentCapacityWeightValidator extends BaseValidator {
  get errorMessages () {
    return {
      'waste-weight': {
        'any.required': 'You must enter a number/weight for each waste type',
        'string.max': `You can enter up to ${MAX_LENGTH} characters`,
        'number.base': 'Weights must be numbers',
        'number.unsafe': `Enter the weights between 0 and 999999999999999`
      }
    }
  }

  get formValidators () {
    return {
      'waste-weight': Joi.number().max(MAX_LENGTH).required()
    }
  }
}
