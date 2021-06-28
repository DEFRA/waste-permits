'use strict'

const Joi = require('@hapi/joi')
const BaseValidator = require('../base.validator')
const Application = require('../../persistence/entities/application.entity')

const { TRADING_NAME_USAGE } = require('../../dynamics')

module.exports = class PermitHolderTradingNameValidator extends BaseValidator {
  get errorMessages () {
    return {
      'use-trading-name': {
        'any.empty': 'Select own name or a trading name',
        'any.required': 'Select own name or a trading name'
      },
      'trading-name': {
        'any.empty': 'Enter a trading or business name',
        'any.required': 'Enter a trading or business name',
        'string.max': `Enter a shorter trading, business or company name with no more than ${Application.tradingName.length.max} characters`
      }
    }
  }

  get formValidators () {
    return {
      'use-trading-name': Joi
        .required(),
      'trading-name': Joi
        .string()
        .max(Application.tradingName.length.max)
        .when('use-trading-name', {
          is: TRADING_NAME_USAGE.YES,
          then: Joi.required()
        })
    }
  }
}
