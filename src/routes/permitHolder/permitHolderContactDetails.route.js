'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PermitHolderContactDetailsController = require('../../controllers/permitHolder/permitHolderContactDetails.controller')
const PermitHolderContactDetailsValidator = require('../../validators/permitHolderContactDetails.validator')
const validator = new PermitHolderContactDetailsValidator()
const controller = new PermitHolderContactDetailsController({route: Constants.Routes.PERMIT_HOLDER_CONTACT_DETAILS, validator})

module.exports = Route.register('GET, POST', controller, validator)
