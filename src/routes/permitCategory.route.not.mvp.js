'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PermitCategoryController = require('../controllers/permitCategory.controller')
const PermitCategoryValidator = require('../validators/permitCategory.validator')
const validator = new PermitCategoryValidator()
const controller = new PermitCategoryController(Constants.Routes.PERMIT_CATEGORY)

module.exports = Route.register('GET, POST', controller, validator)
