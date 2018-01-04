'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PostcodeController = require('../controllers/postcode.controller')
const PostcodeValidator = require('../validators/postcode.validator')
const validator = new PostcodeValidator()
const controller = new PostcodeController(Constants.Routes.POSTCODE)

module.exports = Route.register('GET, POST', controller, validator)
