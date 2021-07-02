'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const ERROR_MESSAGE = 'You must select an answer'

module.exports = class FloodRiskValidator extends BaseValidator {
  get errorMessages () {
    return {
      'flood-risk': {
        'any.empty': ERROR_MESSAGE,
        'any.required': ERROR_MESSAGE
      }
    }
  }

  get formValidators () {
    return {
      'flood-risk': Joi
        .required()
    }
  }
}
