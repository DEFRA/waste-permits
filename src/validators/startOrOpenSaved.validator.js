'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')

module.exports = class StartOrOpenSavedValidator extends BaseValidator {
  constructor () {
    super()

    this.errorMessages = {
      'started-application': {
        'any.required': `Select start new or open a saved application`
      }
    }
  }

  getFormValidators () {
    return {
      'started-application': Joi.string().required()
    }
  }
}
