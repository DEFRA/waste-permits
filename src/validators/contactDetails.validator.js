'use strict'

const Joi = require('joi')
const BaseValidator = require('./base.validator')
const Constants = require('../constants')
const Account = require('../models/account.model')
const AddressDetail = require('../models/addressDetail.model')
const Contact = require('../models/contact.model')

const PLUSES_AND_SPACES_REGEX = /(\+|\s)/g
const PLUSES_SPACES_AND_NUMBERS_REGEX = /^[0-9 +]*$/
const PLUSES_CANNOT_PRECEED_ZERO = /^(\+[ ]*[1-9][0-9 ]*|[^+][0-9 ]*)$/
const LEADING_AND_TRAILING_DASHES_REGEX = /(^-.*$|^.*-$)/
const LETTERS_HYPHENS_AND_APOSTROPHES_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/
const { EMAIL_VALID_REGEX } = Constants.Validation

module.exports = class ContactDetailsValidator extends BaseValidator {
  get errorMessages () {
    return {
      'first-name': {
        'any.empty': `Enter a first name`,
        'any.required': `Enter a first name`,
        'string.min': `First name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `First name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `First name cannot start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter first name with no more than ${Contact.firstName.length.max} characters`
      },
      'last-name': {
        'any.empty': `Enter a last name`,
        'any.required': `Enter a last name`,
        'string.min': `Last name must have at least two letters - if you entered an initial please enter a name`,
        'custom.invalid': `Last name can only include letters, hyphens and apostrophes - delete any other characters`,
        'custom.no-leading-and-trailing-dashes': `Last name cannot start or end with a dash - delete the dash`,
        'string.max': `Enter a shorter last name with no more than ${Contact.lastName.length.max} characters`
      },
      'agent-company': {
        'any.empty': `Enter the agent’s trading, business or company name`,
        'any.required': `Enter the agent’s trading, business or company name`,
        'string.max': `Enter a shorter trading, business or company name with no more than ${Account.accountName.length.max} characters`
      },
      'telephone': {
        'any.empty': `Enter a telephone number`,
        'any.required': `Enter a telephone number`,
        'custom.invalid': `Telephone number can only include numbers, spaces and the + sign. Please remove any other characters.`,
        'custom.plus-zero': `The + sign for international numbers should be at the start of the number, followed by a number 1 to 9, not a 0`,
        'custom.min': `That telephone number is too short. It should have at least ${AddressDetail.telephone.length.min} characters. Make sure you include the area code.`,
        'custom.max': `That telephone number is too long. It should have no more than ${AddressDetail.telephone.length.maxDigits} digits.`,
        'string.max': `That telephone number is too long. It should have no more than ${AddressDetail.telephone.length.max} characters.`
      },
      'email': {
        'any.empty': `Enter an email address for the main contact`,
        'any.required': `Enter an email address for the main contact`,
        'string.regex.base': `Enter a valid email address for the main contact`,
        'string.max': `Enter a shorter email address for the main contact with no more than ${Contact.email.length.max} characters`
      }
    }
  }

  get formValidators () {
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
        .required(),
      'agent-company': Joi
        .string()
        .max(Account.accountName.length.max)
        .when('is-contact-an-agent', {
          is: 'on',
          then: Joi.required(),
          otherwise: Joi.optional() }),
      'telephone': Joi
        .string()
        .max(AddressDetail.telephone.length.max)
        .required(),
      'email': Joi
        .string()
        .max(Contact.email.length.max)
        .regex(EMAIL_VALID_REGEX)
        .required()
    }
  }

  get customValidators () {
    return {
      'first-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      },
      'last-name': {
        'custom.invalid': (value) => !(LETTERS_HYPHENS_AND_APOSTROPHES_REGEX).test(value),
        'custom.no-leading-and-trailing-dashes': (value) => (LEADING_AND_TRAILING_DASHES_REGEX).test(value)
      },
      'telephone': {
        'custom.invalid': (value) => !(PLUSES_SPACES_AND_NUMBERS_REGEX).test(value),
        'custom.plus-zero': (value) => !(PLUSES_CANNOT_PRECEED_ZERO).test(value),
        'custom.min': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length < AddressDetail.telephone.length.min,
        'custom.max': (value) => value.replace(PLUSES_AND_SPACES_REGEX, '').length > AddressDetail.telephone.length.maxDigits
      }
    }
  }
}
