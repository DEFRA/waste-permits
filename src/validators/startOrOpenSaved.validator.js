'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')

module.exports = class StartOrOpenSavedValidator extends BaseValidator {
  get errorMessages () {
    return {
      'started-application': {
        'any.required': 'Select start new or open a saved application'
      }
    }
  }

  get formValidators () {
    return {
      'started-application': Joi.string().required()
    }
  }
}
