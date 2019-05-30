'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class AirDispersionModellingValidator extends BaseValidator {
  get errorMessages () {
    return {
      'air-dispersion-modelling': {
        'any.empty': 'Say if you need to include a dispersion modelling report',
        'any.required': 'Say if you need to include a dispersion modelling report'
      }
    }
  }

  get formValidators () {
    return {
      'air-dispersion-modelling': Joi
        .required()
    }
  }
}
