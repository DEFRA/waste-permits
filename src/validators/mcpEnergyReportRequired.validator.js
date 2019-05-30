'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class EnergyReportRequiredValidator extends BaseValidator {
  get errorMessages () {
    return {
      'new-or-refurbished': {
        'any.empty': 'Select yes or no',
        'any.required': 'Select yes or no'
      }
    }
  }

  get formValidators () {
    return {
      'new-or-refurbished': Joi
        .required()
    }
  }
}
