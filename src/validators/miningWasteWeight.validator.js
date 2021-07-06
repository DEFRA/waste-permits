'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class MiningWasteWeightValidator extends BaseValidator {
  get errorMessages () {
    return {
      'mining-waste-weight': {
        'any.required': 'Enter a weight',
        'number.base': 'The weight must be a number',
        'number.unsafe': 'Enter the weight between 0 and 99999999'
      }
    }
  }

  get formValidators () {
    return {
      'mining-waste-weight': Joi
        .number()
        .max(99999999)
        .required()
    }
  }
}
