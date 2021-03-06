'use strict'

const Merge = require('deepmerge')
const Dynamics = require('../dynamics')
const Routes = require('../routes')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const DrainageTypes = Merge({}, Dynamics.DrainageTypes)

module.exports = class DrainageTypeFailController extends BaseController {
  async doGet (request, h) {
    const { application, standardRule } = await RecoveryService.createApplicationContext(h, { standardRule: true })
    const pageContext = this.createPageContext(h)

    const drainageType = Object.values(DrainageTypes)
      .find(({ type }) => type === application.drainageType)

    if (!drainageType) {
      throw new Error(`Unexpected drainage type (${application.drainageType})`)
    }

    if (drainageType.allowed && drainageType.exceptions && drainageType.exceptions.includes(standardRule.code)) {
      drainageType.allowed = false
    }

    if (drainageType.allowed) {
      return this.redirect({ h, route: Routes.TASK_LIST })
    }

    drainageType.description = drainageType.description.toLowerCase()
    drainageType.isWatercourse = drainageType === DrainageTypes.WATERCOURSE

    pageContext.drainageType = drainageType

    return this.showView({ h, pageContext })
  }
}
