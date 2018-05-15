'use strict'

const Joi = require('joi')

const Constants = require('../constants')
const BaseValidator = require('./base.validator')
const AddressDetail = require('../models/addressDetail.model')
const Contact = require('../models/contact.model')

const PLUSES_AND_SPACES_REGEX = /(\+|\s)/g
const PLUSES_SPACES_AND_NUMBERS_REGEX = /^[0-9 +]*$/
const PLUSES_CANNOT_PRECEED_ZERO = /^(\+[1-9]+[0-9]*|[^+][0-9]*)$/
const {EMAIL_VALID_REGEX} = Constants.Validation

module.exports = class PermitHolderNameAndDateOfBirthValidator extends BaseValidator {
  constructor (options) {
    super()
    this.validatorOptions = options

    this.errorMessages = {
      'email': {
        'any.empty': `Enter an email address`,
        'any.required': `Enter an email address`,
        'string.regex.base': `Enter a valid email address`,
        'string.max': `Enter a shorter email address with no more than ${Contact.email.length.max} characters`
      },
      'telephone': {
        'any.empty': `Enter a telephone number`,
        'any.required': `Enter a telephone number`,
        'custom.invalid': `Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.`,
        'custom.plus-zero': `The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0`,
        'custom.min': `That telephone number is too short. It should have at least ${AddressDetail.telephone.length.min} characters. Make sure you include the area code.`,
        'custom.max': `That telephone number is too long. It should have no more than ${AddressDetail.telephone.length.max} characters.`
      }
    }
  }

  getFormValidators () {
    return {
      'email': Joi
        .string()
        .max(Contact.email.length.max)
        .regex(EMAIL_VALID_REGEX)
        .required(),
      'telephone': Joi
        .string()
        .required()
    }
  }

  customValidators () {
    return {
      'telephone': {
        'custom.invalid': (value) => !(PLUSES_SPACES_AND_NUMBERS_REGEX).test(value),
        'custom.plus-zero': (value) => !(PLUSES_CANNOT_PRECEED_ZERO).test(value),
        'custom.min': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length < AddressDetail.telephone.length.min,
        'custom.max': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length > AddressDetail.telephone.length.max
      }
    }
  }
}
