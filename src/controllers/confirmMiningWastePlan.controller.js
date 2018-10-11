'use strict'

const Merge = require('deepmerge')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MiningWastePlans } = require('../dynamics')

module.exports = class ConfirmMiningWastePlanController extends BaseController {
  async doGet (request, h, errors) {
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })
    const pageContext = this.createPageContext(request, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'mining-waste-plan': application.miningWastePlan
      }
    }

    const miningWastePlan = pageContext.formValues['mining-waste-plan']

    const miningWastePlans = Object.entries(Merge({}, MiningWastePlans))
      .map(([plan, miningWastePlan]) => miningWastePlan)

    miningWastePlans.forEach((item) => {
      item.selected = miningWastePlan === item.type
    })

    pageContext.miningWastePlans = miningWastePlans

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, { application: true })
      const { application } = context

      const plan = parseInt(request.payload['mining-waste-plan'])

      const miningWastePlan = Object.entries(Merge({}, MiningWastePlans))
        .map(([plan, miningWastePlan]) => miningWastePlan)
        .filter((miningWastePlan) => miningWastePlan.type === plan)
        .pop()

      if (!miningWastePlan) {
        throw new Error(`Unexpected mining waste plan (${plan})`)
      }

      application.miningWastePlan = miningWastePlan.type
      await application.save(context)

      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }
}
