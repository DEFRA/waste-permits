'use strict'

const Handlebars = require('handlebars')

const Routes = require('../routes')
const BaseController = require('./base.controller')
const BaseTaskList = require('../models/taskList/base.taskList')
const StandardRule = require('../persistence/entities/standardRule.entity')
const RecoveryService = require('../services/recovery.service')
const ApplicationCostItem = require('../models/applicationCostItem.model')
const WasteActivities = require('../models/wasteActivities.model')
const { FACILITY_TYPES: { MCP } } = require('../dynamics')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors, firstTimeIn = true) {
    const context = await RecoveryService.createApplicationContext(h)
    const TaskList = await BaseTaskList.getTaskListClass(context)

    const permitType = TaskList.isStandardRules ? 'standard rules' : 'bespoke'
    this.route.pageHeading = await Handlebars.compile(this.orginalPageHeading)({ permitType })

    const pageContext = this.createPageContext(h, errors)

    const showError = Boolean(request.query.showError)
    if (showError && firstTimeIn) {
      return this.doGet(request, h, this.setCustomError('any.required', 'task-list-not-complete'), false)
    }

    pageContext.taskList = await TaskList.buildTaskList(context)
    pageContext.permitCategoryRoute = Routes.BESPOKE_OR_STANDARD_RULES.path
    pageContext.activitiesRoute = Routes.WASTE_ACTIVITY_CONTINUE.path

    if (TaskList.isStandardRules) {
      pageContext.standardRule = await StandardRule.getByApplicationLineId(context, context.applicationLineId)
    } else {
      const { facilityType, airDispersionModellingRequired, mcpType } = context.taskDeterminants

      if (facilityType === MCP) {
        pageContext.isMCP = true
        pageContext.activityName = airDispersionModellingRequired
          ? 'Medium combustion plant site - requires dispersion modelling'
          : 'Medium combustion plant site - does not require dispersion modelling'

        pageContext.mcpType = mcpType
      } else {
        const wasteActivities = await WasteActivities.get(context)
        const { wasteAssessments } = context.taskDeterminants
        pageContext.isWaste = true
        pageContext.activitiesNumberText = wasteActivities.textForNumberOfWasteActivities
        if (wasteActivities.wasteActivitiesLength) {
          pageContext.activities = wasteActivities.wasteActivitiesValues
        }
        pageContext.assessmentsNumberText = (wasteAssessments.length || 'no') +
          ' assessment' +
          (wasteAssessments.length === 1 ? '' : 's')
        if (wasteAssessments.length) {
          pageContext.assessments = wasteAssessments
        }
        pageContext.activityName = 'Waste operation'
        pageContext.mcpType = ''
      }

      pageContext.totalCostIem = new ApplicationCostItem({
        description: 'Total',
        cost: context.application.lineItemsTotalAmount
      })
    }

    pageContext.formValues = request.payload

    console.log('!! availableTasks !!', pageContext.taskList.context.availableTasks)
    console.log('!! evidence section!!', pageContext.taskList.sections[4])
    return this.showView({ h, pageContext })
  }
}
