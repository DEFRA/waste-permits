'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteDisposalAndRecoveryCodes = require('../models/wasteDisposalAndRecoveryCodes.model')
const Routes = require('../routes')
const { WASTE_RD_RECOVERY: { path: wasteRecoveryCodesBasePath } } = Routes

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
    const pageHeading = `Select the disposal codes for ${wasteDisposalAndRecoveryCodes.activityDisplayName}`
    const pageTitle = Constants.buildPageTitle(pageHeading)
    const codeList = wasteDisposalAndRecoveryCodes.wasteDisposalCodeList

    const pageContext = this.createPageContext(h, errors)
    Object.assign(pageContext, { pageHeading, pageTitle, codeList })

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteDisposalAndRecoveryCodes = await getModelForProvidedActivityIndex(context, request)

    const selectedWasteDisposalCodes = request.payload.code ? request.payload.code.split(',', 50) : []

    wasteDisposalAndRecoveryCodes.setWasteDisposalCodes(selectedWasteDisposalCodes)
    await wasteDisposalAndRecoveryCodes.save(context)

    return this.redirect({ h, path: `${wasteRecoveryCodesBasePath}/${wasteDisposalAndRecoveryCodes.forActivityIndex}` })
  }
}
