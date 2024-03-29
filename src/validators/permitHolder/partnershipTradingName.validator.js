
const TradingNameValidator = require('./tradingName.validator')
const Application = require('../../persistence/entities/application.entity')

module.exports = class PartnershipTradingNameValidator extends TradingNameValidator {
  get errorMessages () {
    return {
      'trading-name': {
        'string.empty': 'Enter a name for the partnership',
        'any.required': 'Enter a name for the partnership',
        'string.max': `Enter a shorter partnership name with no more than ${Application.tradingName.length.max} characters`
      }
    }
  }
}
