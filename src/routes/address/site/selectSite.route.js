'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const AddressSelectSiteController = require('../../../controllers/address/site/selectSite.controller')
const AddressSelectValidator = require('../../../validators/address/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectSiteController({route: Constants.Routes.SELECT_SITE, nextRoute: Constants.Routes.TASK_LIST, validator})

module.exports = Route.register('GET, POST', controller, validator)
