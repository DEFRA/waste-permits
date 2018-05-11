'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const Constants = require('../constants')
const Account = require('../models/account.model')
const AddressDetail = require('../models/addressDetail.model')
const Contact = require('../models/contact.model')

const PLUSES_AND_SPACES_REGEX = /(\+|\s)/g
const PLUSES_SPACES_AND_NUMBERS_REGEX = /^[0-9 +]*$/
const PLUSES_CANNOT_PRECEED_ZERO = /^(\+[1-9]+[0-9]*|[^+][0-9]*)$/
const LEADING_AND_TRAILING_DASHES_REGEX = /(^-.*$|^.*-$)/
const LETTERS_HYPHENS_AND_APOSTROPHES_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/
const {EMAIL_VALID_REGEX} = Constants.Validation

module.exports = class PermitHolderNameAndDateOfBirthValidator extends BaseValidator {
  constructor (options) {
    super()
    this.validatorOptions = options

    this.errorMessages = {
      'first-name': {
        'any.empty': `Enter a first name`,
        'any.required': `Enter a first name`,
        'string.min': `First name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `First name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `First name can’t start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter first name with no more than ${Contact.firstName.length.max} characters`
      },
      'last-name': {
        'any.empty': `Enter a last name`,
        'any.required': `Enter a last name`,
        'string.min': `Last name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `Last name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `Last name can’t start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter last name with no more than ${Contact.lastName.length.max} characters`
      }
    }
  }

  getFormValidators () {
    return {
      'first-name': Joi
        .string()
        .min(2)
        .max(Contact.firstName.length.max)
        .required(),
      'last-name': Joi
        .string()
        .min(2)
        .max(Contact.lastName.length.max)
        .required()
    }
  }

  customValidators () {
    return {
      'first-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      },
      'last-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      }
    }
  }
}
