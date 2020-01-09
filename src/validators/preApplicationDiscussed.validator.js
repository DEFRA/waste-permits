'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class PreApplicationRequiredValidator extends BaseValidator {
  get errorMessages () {
    return {
      'pre-application-discussed': {
        'any.required': 'Select if you have received or would like to receive pre-application advice'
      }
    }
  }

  get formValidators () {
    return {
      'pre-application-discussed': Joi
        .required()
    }
  }
}
