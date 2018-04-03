'use strict'

const EmailSentController = require('./base/emailSent.controller')
const SaveAndReturn = require('../../models/taskList/saveAndReturn.model')

module.exports = class EmailSentCheckController extends EmailSentController {
  get view () {
    return 'saveAndReturn/emailSentCheck'
  }

  async updateCompleteness (...args) {
    await SaveAndReturn.updateCompleteness(...args)
  }
}
