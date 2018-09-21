'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class ConfirmMiningWastePlanValidator extends BaseValidator {
  get errorMessages () {
    return {
      'mining-waste-plan': {
        'any.required': `Select the plan you will use`
      }
    }
  }

  get formValidators () {
    return {
      'mining-waste-plan': Joi
        .string()
        .required()
    }
  }
}
