'use strict'

const Merge = require('deepmerge')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const DrainageTypeDrain = require('../models/taskList/drainageTypeDrain.task')
const RecoveryService = require('../services/recovery.service')
const { DrainageTypes } = require('../dynamics')

const { DRAINAGE_TYPE_FAIL, TASK_LIST } = Routes

module.exports = class drainageTypeController extends BaseController {
  async doGet (request, h, errors) {
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'drainage-type': application.drainageType
      }
    }

    const drainageType = pageContext.formValues['drainage-type']

    const drainageTypes = Object.entries(Merge({}, DrainageTypes))
      .map(([type, drainageType]) => drainageType)

    drainageTypes.forEach((item) => {
      item.selected = drainageType === item.type
    })

    pageContext.drainageTypes = drainageTypes

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    let path

    const context = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const { application, standardRule } = context

    const type = parseInt(request.payload['drainage-type'])

    const drainageType = Object.entries(Merge({}, DrainageTypes))
      .map(([type, drainageType]) => drainageType)
      .filter((drainageType) => drainageType.type === type)
      .pop()

    if (!drainageType) {
      throw new Error(`Unexpected drainage type (${type})`)
    }

    if (drainageType.allowed && drainageType.exceptions && drainageType.exceptions.includes(standardRule.code)) {
      drainageType.allowed = false
    }

    application.drainageType = drainageType.type
    await application.save(context)

    if (drainageType.allowed) {
      await DrainageTypeDrain.updateCompleteness(context)
      path = TASK_LIST.path
    } else {
      await DrainageTypeDrain.clearCompleteness(context)
      path = DRAINAGE_TYPE_FAIL.path
    }

    return this.redirect({ h, path })
  }
}
