'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class BurningWasteBiomassValidator extends BaseValidator {
  get errorMessages () {
    return {
      'thermal-rating': {
        'string.empty': 'Select yes or no',
        'any.required': 'Select yes or no'
      },
      'meets-criteria': {
        'string.empty': 'Select yes or no',
        'any.required': 'Select yes or no'
      }
    }
  }

  get formValidators () {
    return {
      'thermal-rating': Joi
        .required(),
      'meets-criteria': Joi
        .when('thermal-rating', {
          is: 'over 20',
          then: Joi.required()
        })
    }
  }
}
