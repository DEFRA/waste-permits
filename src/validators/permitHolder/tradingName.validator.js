'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')
const Application = require('../../persistence/entities/application.entity')

module.exports = class TradingNameValidator extends BaseValidator {
  get errorMessages () {
    return {
      'trading-name': {
        'any.empty': `Enter a name`,
        'any.required': `Enter a name`,
        'string.max': `Enter a shorter name with no more than ${Application.tradingName.length.max} characters`
      }
    }
  }

  get formValidators () {
    return {
      'trading-name': Joi
        .string()
        .max(Application.tradingName.length.max)
        .required()
    }
  }
}
