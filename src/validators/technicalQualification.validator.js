'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class TechnicalQualificationValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'technical-qualification': {
        'any.empty': 'Select a qualification',
        'any.required': 'Select a qualification'
      }
    }
  }

  getFormValidators () {
    return {
      'technical-qualification': Joi
        .required()
    }
  }
}
