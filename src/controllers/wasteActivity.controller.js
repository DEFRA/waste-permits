'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteActivities = require('../models/wasteActivities.model')
const ItemEntity = require('../persistence/entities/item.entity')
const Routes = require('../routes')
const couldBeInstallations = {
  '1-16-9': true
}

module.exports = class WasteActivityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants: { facilityType } } = context

    const wasteActivitiesForFacilityTypes = await ItemEntity.listWasteActivitiesForFacilityTypes(context, [facilityType.id])
    // TODO: currently the canApplyOnline flags are not correctly set so showing all that can be applied for.
    //   Should be:
    //   const onlyOnlineWasteActivitiesForFacilityTypes = wasteActivitiesForFacilityTypes.filter(({ canApplyFor, canApplyOnline }) => canApplyFor && canApplyOnline)
    const onlyOnlineWasteActivitiesForFacilityTypes = wasteActivitiesForFacilityTypes.filter(({ canApplyFor }) => canApplyFor)

    const pageContext = this.createPageContext(h, errors)

    pageContext.activities = onlyOnlineWasteActivitiesForFacilityTypes.map(({ shortName, itemName }) => ({ id: shortName, text: itemName, couldBeAnInstallation: couldBeInstallations[shortName] }))
    pageContext.previousLink = Routes[this.route.previousRoute].path

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const { activity: selectedActivity } = request.payload

    const wasteActivities = await WasteActivities.get(context)
    wasteActivities.addWasteActivity(selectedActivity)
    await wasteActivities.save(context)

    return this.redirect({ h })
  }
}
