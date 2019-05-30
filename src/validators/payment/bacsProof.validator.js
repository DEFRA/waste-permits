'use strict'

const moment = require('moment')
const Joi = require('@hapi/joi')
const BaseValidator = require('../base.validator')
const Payment = require('../../persistence/entities/payment.entity')

const NUMBER_WITH_OPTIONAL_POUND_SIGN_REGEX = /^\s*£?\s*([1-9]\d{0,2}(,\d{3})*(\.\d{2,})?|[1-9]\d*(\.\d{2,})?|0(\.\d{2,})?)\s*$/
const TOO_MANY_DECIMAL_PLACES_REGEX = /\.\d{3}/

function parseDate (day, month, year) {
  return day && month && year
    ? moment({ day, month: parseInt(month) - 1, year })
    : { isValid: () => false }
}
function isFuture (day, month, year) {
  const date = parseDate(day, month, year)
  return date.isValid() && (date.diff(Date.now(), 'days', true) > 0)
}

module.exports = class BacsProofValidator extends BaseValidator {
  get errorMessages () {
    return {
      'date-paid-day': {
        'custom.invalid': 'Enter a valid date',
        'custom.future': 'Date cannot be in the future. You must pay before you send the application.'
      },
      'amount-paid': {
        'any.empty': 'Enter the amount paid',
        'any.required': 'Enter the amount paid',
        'string.regex.base': 'Enter an amount of money',
        'custom.too-many-digits': 'Enter the amount with a maximum of two decimal places'
      },
      'payment-reference': {
        'any.empty': 'Enter a payment reference',
        'any.required': 'Enter a payment reference',
        'string.max': `Enter a payment reference with no more than ${Payment.customerPaymentReference.length.max} characters`
      }
    }
  }

  get formValidators () {
    return {
      'payment-reference': Joi
        .string().required()
        .max(Payment.customerPaymentReference.length.max),
      'amount-paid': Joi.string().required()
        .regex(NUMBER_WITH_OPTIONAL_POUND_SIGN_REGEX)
    }
  }

  get customValidators () {
    return {
      'date-paid-day': {
        'custom.invalid': (day, { 'date-paid-month': month, 'date-paid-year': year }) => !parseDate(day, month, year).isValid(),
        'custom.future': (day, { 'date-paid-month': month, 'date-paid-year': year }) => isFuture(day, month, year)
      },
      'amount-paid': {
        'custom.too-many-digits': (value) => Boolean(value.match(NUMBER_WITH_OPTIONAL_POUND_SIGN_REGEX) && value.match(TOO_MANY_DECIMAL_PLACES_REGEX))
      }
    }
  }
}
