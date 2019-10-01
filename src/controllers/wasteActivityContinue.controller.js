'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteActivities = require('../models/wasteActivities.model')
const Routes = require('../routes')

module.exports = class WasteActivityContinueController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { wasteActivitiesValues, isFull } = await WasteActivities.get(context)

    const pageContext = this.createPageContext(h, errors)
    pageContext.canAddMore = !isFull
    pageContext.activities = wasteActivitiesValues
    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const wasteActivities = await WasteActivities.get(context)

    const addActivity = request.payload['add-activity']
    const deleteActivity = request.payload['delete-activity']

    if (addActivity) {
      return this.redirect({ h, path: Routes.WASTE_ACTIVITY.path })
    }

    if (deleteActivity) {
      const index = parseInt(deleteActivity)
      if (wasteActivities.deleteWasteActivity(index)) {
        await wasteActivities.save(context)
      }
      if (wasteActivities.wasteActivitiesLength === 0) {
        return this.redirect({ h, path: Routes.WASTE_ACTIVITY.path })
      } else {
        return this.redirect({ h, path: Routes.WASTE_ACTIVITY_CONTINUE.path })
      }
    }

    if (wasteActivities.hasDuplicateWasteActivities) {
      return this.redirect({ h, path: Routes.WASTE_ACTIVITY_NAME.path })
    }

    return this.redirect({ h })
  }
}
