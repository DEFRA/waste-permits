'use strict'

const Joi = require('joi')
const BaseValidator = require('../base.validator')
const Application = require('../../models/application.model')

module.exports = class PermitHolderTradingNameValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'trading-name': {
        'any.empty': `Enter a name for the partnership`,
        'any.required': `Enter a name for the partnership`,
        'string.max': `Enter a shorter partnership name with no more than ${Application.tradingName.length.max} characters`
      }
    }
  }

  getFormValidators () {
    return {
      'trading-name': Joi
        .string()
        .max(Application.tradingName.length.max)
        .required()
    }
  }
}
