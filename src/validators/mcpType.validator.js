'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class McpTypeValidator extends BaseValidator {
  get errorMessages () {
    return {
      'mcp-type': {
        'any.empty': 'Select what your permit is for',
        'any.required': 'Select what your permit is for'
      }
    }
  }

  get formValidators () {
    return {
      'mcp-type': Joi
        .string()
        .required()
    }
  }
}
