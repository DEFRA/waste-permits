'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const TaskList = require('../models/taskList/taskList.model')
const TaskListValidator = require('../validators/taskList.validator')

module.exports = class TaskListController extends BaseController {
  async doGet (request, h, errors) {
    // const pageContext = this.createPageContext(errors)
    const {authToken, applicationLineId, application, payment, standardRule} = await this.createApplicationContext(request, {application: true, payment: true, standardRule: true})
    const taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)

    const redirectPath = await this.checkRouteAccess(application, payment)
    if (redirectPath) {
      return this.redirect(request, h, redirectPath)
    }

    const taskListValidator = new TaskListValidator()
    taskListValidator.setErrorMessages(taskList)

    const pageContext = this.createPageContext(errors, taskListValidator)

    pageContext.standardRule = standardRule
    pageContext.taskList = taskList

    pageContext.formValues = request.payload

    pageContext.permitCategoryRoute = Constants.Routes.PERMIT_CATEGORY.path

    return this.showView(request, h, 'taskList', pageContext)
  }

  async doPost (request, h, errors) {
    const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

    // Perform manual (non-Joi) validation of dynamic form content
    errors = await this._validateDynamicFormContent(request, authToken, applicationId, applicationLineId)

    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      return this.redirect(request, h, Constants.Routes.CHECK_BEFORE_SENDING.path)
    }
  }

  // This is required because the number of directors that relate to an application is variable,
  // depending on which company is chosen to relate to the application. It has not been possible to
  // validate the varying number of day of birth fieds using the standard Joi validation methods.
  // async _validateDynamicFormContent (request, isComplete) {
  //   let errors

  //   if (!isComplete) {
  //     const errorPath = 'task-list-not-complete'
  //     errors = {
  //       details: [
  //         {
  //           message: `"${errorPath}" is required`,
  //           path: [errorPath],
  //           type: 'any.required',
  //           context: { key: errorPath, label: errorPath }
  //         }]
  //     }
  //   }

  //   return errors
  // }

  // TODO comment

  // This is required because the number of directors that relate to an application is variable,
  // depending on which company is chosen to relate to the application. It has not been possible to
  // validate the varying number of day of birth fieds using the standard Joi validation methods.
  async _validateDynamicFormContent (request, authToken, applicationId, applicationLineId) {
    const taskList = await TaskList.getByApplicationLineId(authToken, applicationLineId)
    // const isComplete = await taskList.isComplete(authToken, applicationId, applicationLineId)

    let errors = []

    // TODO
    // Iterate the task list and check that each item is complete

    // const taskListModels = taskList.getTaskListModels()
    // console.log(taskListModels.entries())

    const visibleItems = taskList.getVisibleItems()
    console.log(visibleItems)

    for (let item of visibleItems) {
      const model = item.taskListModel
      if (model && (! await model.isComplete(authToken, applicationId, applicationLineId))) {
        console.log('##############xxx- not complete:', model)

        // TODO ******* add the error *********

        // errors.details.push({
        //   message: `"${directorDobField}" is invalid`,
        //   path: [directorDobField],
        //   type: 'invalid',
        //   context: { key: directorDobField, label: directorDobField }
        // })

      }
    }

    // for (let [index, model] of taskListModels.entries()) {
      // console.log('##############xxx:', await model.isComplete(authToken, applicationId, applicationLineId))



      // if (! await model.isComplete(authToken, applicationId, applicationLineId)) {
        // console.log('##############xxx1 not complete:', index)
        // console.log(taskList.sections)
      // }
    // }

    // Validate the entered DOB for each director
    // for (let i = 0; i < directors.length; i++) {
    //   const director = directors[i]
    //   const directorDobField = `director-dob-day-${i}`
    //   let dobDay = request.payload[directorDobField]

    //   if (dobDay === undefined) {
    //     // DOB day has not been entered
    //     errors.details.push({
    //       message: `"${directorDobField}" is required`,
    //       path: [directorDobField],
    //       type: 'any.required',
    //       context: { key: directorDobField, label: directorDobField }
    //     })
    //   } else {
    //     let daysInBirthMonth = moment(`${director.dob.year}-${director.dob.month}`, 'YYYY-MM').daysInMonth()
    //     daysInBirthMonth = isNaN(daysInBirthMonth) ? 31 : daysInBirthMonth

    //     dobDay = parseInt(dobDay)
    //     if (isNaN(dobDay) || dobDay < 1 || dobDay > daysInBirthMonth) {
    //       // DOB day is invalid
    //       errors.details.push({
    //         message: `"${directorDobField}" is invalid`,
    //         path: [directorDobField],
    //         type: 'invalid',
    //         context: { key: directorDobField, label: directorDobField }
    //       })
    //     }
    //   }
    // }

    if (errors && errors.details.length === 0) {
      errors = undefined
    }

    return errors
  }
}
