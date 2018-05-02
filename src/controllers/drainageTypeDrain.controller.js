'use strict'

const Merge = require('deepmerge')
const Constants = require('../constants')
const BaseController = require('./base.controller')
const DrainageTypeDrain = require('../models/taskList/drainageTypeDrain.model')
const RecoveryService = require('../services/recovery.service')
const DrainageTypes = Merge({}, Constants.Dynamics.DrainageTypes)

const {DRAINAGE_TYPE_FAIL, TASK_LIST} = Constants.Routes

module.exports = class drainageTypeController extends BaseController {
  async doGet (request, h, errors) {
    const {application} = await RecoveryService.createApplicationContext(h, {application: true})
    const pageContext = this.createPageContext(errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'drainage-type': application.drainageType
      }
    }

    const drainageType = pageContext.formValues['drainage-type']

    const drainageTypes = Object.keys(DrainageTypes)
      .map((key) => DrainageTypes[key])

    drainageTypes.forEach((item) => {
      item.selected = drainageType === item.type
    })

    pageContext.drainageTypes = drainageTypes

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    let redirectPath

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId, applicationLineId, application, standardRule} = await RecoveryService.createApplicationContext(h, {application: true, standardRule: true})

      const type = parseInt(request.payload['drainage-type'])

      const drainageTypes = Constants.Dynamics.DrainageTypes

      const drainageType = Object.keys(drainageTypes)
        .filter((key) => drainageTypes[key].type === type)
        .map((key) => drainageTypes[key])
        .pop()

      if (!drainageType) {
        throw new Error(`Unexpected drainage type (${type})`)
      }

      if (drainageType.allowed && drainageType.exceptions && drainageType.exceptions.includes(standardRule.code)) {
        drainageType.allowed = false
      }

      application.drainageType = drainageType.type
      await application.save(authToken)

      if (drainageType.allowed) {
        await DrainageTypeDrain.updateCompleteness(authToken, applicationId, applicationLineId)
        redirectPath = TASK_LIST.path
      } else {
        await DrainageTypeDrain.clearCompleteness(authToken, applicationId, applicationLineId)
        redirectPath = DRAINAGE_TYPE_FAIL.path
      }

      return this.redirect({request, h, redirectPath})
    }
  }
}
