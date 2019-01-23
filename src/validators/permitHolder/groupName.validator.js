
const TradingNameValidator = require('./tradingName.validator')
const Application = require('../../persistence/entities/application.entity')

module.exports = class GroupNameValidator extends TradingNameValidator {
  get errorMessages () {
    return {
      'trading-name': {
        'any.empty': `Enter a name`,
        'any.required': `Enter a name`,
        'string.max': `Enter a shorter name with no more than ${Application.tradingName.length.max} characters`
      }
    }
  }
}
