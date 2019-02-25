'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class EnergyReportRequiredValidator extends BaseValidator {
  get errorMessages () {
    return {
      'new-or-refurbished': {
        'any.empty': 'Select yes or no',
        'any.required': 'Select yes or no'
      },
      'total-aggregated-thermal-input': {
        'any.empty': 'Select a thermal input',
        'any.required': 'Select a thermal input'
      },
      'engine-type': {
        'any.empty': 'Select the type of engine it uses',
        'any.required': 'Select the type of engine it uses'
      }
    }
  }

  get formValidators () {
    return {
      'new-or-refurbished': Joi
        .required(),
      'total-aggregated-thermal-input': Joi
        .when('new-or-refurbished', {
          is: 'yes',
          then: Joi.required() }),
      'engine-type': Joi
        .when('new-or-refurbished', {
          is: 'yes',
          then: Joi.required() })
    }
  }
}
