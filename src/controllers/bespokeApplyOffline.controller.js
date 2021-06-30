'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const ItemEntity = require('../persistence/entities/item.entity')

module.exports = class BespokeApplyOfflineController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    pageContext.changeSelectionLink = this.nextPath
    pageContext.pageDescription = this.route.pageDescription

    const { itemType } = this.route
    if (itemType) {
      const context = await RecoveryService.createApplicationContext(h)
      const { taskDeterminants: { facilityType, wasteActivities } } = context
      switch (itemType) {
        case 'wasteActivity': {
          const wasteActivitiesForFacilityTypes = (await ItemEntity.listWasteActivitiesForFacilityTypes(context, [facilityType.id])).filter(({ shortName }) => wasteActivities.includes(shortName))
            .filter(({ canApplyFor, canApplyOnline }) => !canApplyFor || !canApplyOnline)
          if (wasteActivitiesForFacilityTypes.length) {
            pageContext.items = wasteActivitiesForFacilityTypes.map(({ itemName }) => itemName)
          }
        }
      }
    }

    return this.showView({ h, pageContext })
  }
}
