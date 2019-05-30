'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('./base.validator')
const { MANAGEMENT_SYSTEM: { questionCode } } = require('../dynamics').ApplicationQuestions

module.exports = class ManagementSystemSelectValidator extends BaseValidator {
  get errorMessages () {
    return {
      [questionCode]: {
        'any.required': 'Select the management system you will use'
      }
    }
  }

  get formValidators () {
    return {
      [questionCode]: Joi
        .string()
        .required()
    }
  }
}
