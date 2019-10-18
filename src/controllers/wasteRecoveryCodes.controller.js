'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteDisposalAndRecoveryCodes = require('../models/wasteDisposalAndRecoveryCodes.model')
const Routes = require('../routes')
const { WASTE_RD_DISPOSAL: { path: wasteDisposalCodesBasePath } } = Routes

const getModelForProvidedActivityIndex = async (context, request) => {
  const activityIndexInt = Number.parseInt(request.params.activityIndex, 10)
  if (!Number.isNaN(activityIndexInt)) {
    const wasteDisposalAndRecoveryCodes = await WasteDisposalAndRecoveryCodes.getForActivity(context, activityIndexInt)
    if (wasteDisposalAndRecoveryCodes) {
      return wasteDisposalAndRecoveryCodes
    }
  }
  throw new Error('Invalid activity')
}

module.exports = class WasteDisposalCodesController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteDisposalAndRecoveryCodes = await getModelForProvidedActivityIndex(context, request)
    const pageHeading = `Select the recovery codes for ${wasteDisposalAndRecoveryCodes.activityDisplayName}`
    const pageTitle = Constants.buildPageTitle(pageHeading)
    const codeList = wasteDisposalAndRecoveryCodes.wasteRecoveryCodeList

    const pageContext = this.createPageContext(h, errors)
    Object.assign(pageContext, { pageHeading, pageTitle, codeList })

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteDisposalAndRecoveryCodes = await getModelForProvidedActivityIndex(context, request)

    const selectedWasteRecoveryCodes = request.payload.code ? request.payload.code.split(',', 50) : []

    wasteDisposalAndRecoveryCodes.setWasteRecoveryCodes(selectedWasteRecoveryCodes)
    await wasteDisposalAndRecoveryCodes.save(context)

    // If no disposal or recovery codes have been selected then that's an error
    if (!wasteDisposalAndRecoveryCodes.codesHaveBeenSelected) {
      return this.doGet(request, h, { details: [{ path: ['code'], type: 'custom.required' }] })
    }

    // If there are more activities, redirect to the next set of recovery codes
    if (wasteDisposalAndRecoveryCodes.hasNext) {
      return this.redirect({ h, path: `${wasteDisposalCodesBasePath}/${wasteDisposalAndRecoveryCodes.forActivityIndex + 1}` })
    }

    return this.redirect({ h })
  }
}
