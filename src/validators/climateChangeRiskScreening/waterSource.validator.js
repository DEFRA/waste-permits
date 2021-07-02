'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')

const ERROR_MESSAGE = 'You must select an answer'

module.exports = class WaterSourceValidator extends BaseValidator {
  get errorMessages () {
    return {
      'water-source': {
        'string.empty': ERROR_MESSAGE,
        'any.required': ERROR_MESSAGE
      }
    }
  }

  get formValidators () {
    return {
      'water-source': Joi
        .required()
    }
  }
}
