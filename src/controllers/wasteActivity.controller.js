
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const ItemEntity = require('../persistence/entities/item.entity')
const Routes = require('../routes')
const { WASTE_ACTIVITY_APPLY_OFFLINE } = Routes

module.exports = class WasteActivityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants: { facilityType, wasteActivities } } = context

    const wasteActivitiesForFacilityTypes = await ItemEntity.listWasteActivitiesForFacilityTypes(context, [facilityType.id])

    const pageContext = this.createPageContext(h, errors)

    const selected = wasteActivities.map(({ shortName }) => shortName)
    pageContext.activities = wasteActivitiesForFacilityTypes.map(({ shortName, itemName }) => ({ id: shortName, text: itemName, isSelected: selected.includes(shortName) }))
    pageContext.previousLink = Routes[this.route.previousRoute].path

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context
    const { facilityType } = taskDeterminants

    const { activity: activities } = request.payload

    const wasteActivities = activities.split(',')
    await taskDeterminants.save({ wasteActivities })

    const wasteActivitiesForFacilityTypes = (await ItemEntity.listWasteActivitiesForFacilityTypes(context, [facilityType.id]))
      .filter((activity) => taskDeterminants.wasteActivities.includes(activity))

    if (wasteActivitiesForFacilityTypes.find(({ canApplyFor, canApplyOnline }) => !canApplyFor || !canApplyOnline)) {
      return this.redirect({ h, route: WASTE_ACTIVITY_APPLY_OFFLINE })
    }
    return this.redirect({ h })
  }
}
