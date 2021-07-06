'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class ThermalInput20To50MwValidator extends BaseValidator {
  get errorMessages () {
    return {
      'thermal-rating': {
        'string.empty': 'Select yes or no',
        'any.required': 'Select yes or no'
      },
      'engine-type': {
        'string.empty': 'Select where it get its energy from',
        'any.required': 'Select where it get its energy from'
      }
    }
  }

  get formValidators () {
    return {
      'thermal-rating': Joi
        .required(),
      'engine-type': Joi
        .when('thermal-rating', {
          is: '20 to 50',
          then: Joi.required()
        })
    }
  }
}
