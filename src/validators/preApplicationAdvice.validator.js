'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class PreApplicationRequiredValidator extends BaseValidator {
  get errorMessages () {
    return {
      'pre-application-advice': {
        'any.required': 'Select if you have received or would like to receive pre-application advice'
      }
    }
  }

  get formValidators () {
    return {
      'pre-application-advice': Joi
        .required()
    }
  }
}
