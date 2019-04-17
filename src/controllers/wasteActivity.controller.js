
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteActivities = require('../models/wasteActivities.model')
const ItemEntity = require('../persistence/entities/item.entity')
const Routes = require('../routes')
const { WASTE_ACTIVITY_APPLY_OFFLINE } = Routes

module.exports = class WasteActivityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { facilityType = {}, wasteActivities } = context

    const wasteActivitiesForFacilityTypes = await ItemEntity.listWasteActivitiesForFacilityTypes(context, [facilityType.id])

    const pageContext = this.createPageContext(h, errors)

    pageContext.activities = wasteActivitiesForFacilityTypes.map(({ shortName, itemName }) => ({ id: shortName, text: itemName, isSelected: wasteActivities.includes(shortName) }))
    pageContext.previousLink = Routes[this.route.previousRoute].path

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { facilityType = {}, wasteActivities = new WasteActivities() } = context

    const { activity: activities } = request.payload

    wasteActivities.activities = activities
    await wasteActivities.save(context)

    const wasteActivitiesForFacilityTypes = (await ItemEntity.listWasteActivitiesForFacilityTypes(context, [facilityType.id])).filter(({ shortName }) => wasteActivities.includes(shortName))

    if (wasteActivitiesForFacilityTypes.find(({ canApplyFor, canApplyOnline }) => !canApplyFor || !canApplyOnline)) {
      return this.redirect({ h, route: WASTE_ACTIVITY_APPLY_OFFLINE })
    }
    return this.redirect({ h })
  }
}
