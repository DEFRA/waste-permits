module.exports = class controller {
  static getTemplate (options) {
    const { validatorName } = options
    return `
'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class ${validatorName}Validator extends BaseValidator {
  get errorMessages () {
    return {
      'some-data': {
        'string.empty': 'Enter some data',
        'any.required': 'Enter some data',
        'custom.invalid': 'Enter some valid data'
      }
    }
  }

  get formValidators () {
    return {
      'some-data': Joi
        .string()
        .required()
    }
  }

  get customValidators () {
    return {
      'some-data': {
        'custom.invalid': (value) => value === 'invalid'
      }
    }
  }
}
            
`
  }
}
