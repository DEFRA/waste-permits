'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

module.exports = class FacilityTypeValidator extends BaseValidator {
  get errorMessages () {
    return {
      'facility-type': {
        'any.empty': 'Select the type of facility you want',
        'any.required': 'Select the type of facility you want'
      }
    }
  }

  get formValidators () {
    return {
      'facility-type': Joi
        .string()
        .required()
    }
  }
}
