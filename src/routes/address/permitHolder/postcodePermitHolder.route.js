'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const PostcodeController = require('../../../controllers/address/permitHolder/postcodePermitHolder.controller')
const PostcodeValidator = require('../../../validators/address/postcode.validator')
const validator = new PostcodeValidator()
const controller = new PostcodeController({route: Constants.Routes.POSTCODE_PERMIT_HOLDER, validator})

module.exports = Route.register('GET, POST', controller, validator)
