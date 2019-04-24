'use strict'

const Merge = require('deepmerge')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MiningWastePlans } = require('../dynamics')

module.exports = class ConfirmMiningWastePlanController extends BaseController {
  async doGet (request, h, errors) {
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'mining-waste-plan': application.miningWastePlan
      }
    }

    const miningWastePlan = pageContext.formValues['mining-waste-plan']

    const miningWastePlans = Object.values(Merge({}, MiningWastePlans))

    miningWastePlans.forEach((item) => {
      item.selected = miningWastePlan === item.type
    })

    pageContext.miningWastePlans = miningWastePlans

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context

    const plan = parseInt(request.payload['mining-waste-plan'])

    const miningWastePlan = Object.values(Merge({}, MiningWastePlans))
      .find((miningWastePlan) => miningWastePlan.type === plan)

    if (!miningWastePlan) {
      throw new Error(`Unexpected mining waste plan (${plan})`)
    }

    application.miningWastePlan = miningWastePlan.type
    await application.save(context, ['miningWastePlan'])

    return this.redirect({ h })
  }
}
