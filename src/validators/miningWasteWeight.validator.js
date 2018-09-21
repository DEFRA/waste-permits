'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const Application = require('../models/application.model')

module.exports = class MiningWasteWeightValidator extends BaseValidator {
  get errorMessages () {
    return {
      'mining-waste-weight': {
        'any.required': `Enter a weight`,
        'string.max': `Enter the weight using no more than ${Application.miningWasteWeight.length.max} characters`
      }
    }
  }

  get formValidators () {
    return {
      'mining-waste-weight': Joi
        .string()
        .max(Application.miningWasteWeight.length.max)
        .required()
    }
  }
}
