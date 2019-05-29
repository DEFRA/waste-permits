'use strict'

const pdf = require('../services/pdf')
const RecoveryService = require('../services/recovery.service')
const BaseController = require('./base.controller')
const CheckList = require('../models/checkList/checkList')

module.exports = class CheckBeforeSendingController extends BaseController {
  async doGet (request, h) {
    const pageContext = this.createPageContext(h)
    const context = await RecoveryService.createApplicationContext(h)
    const { application } = context
    const { pdfAction } = request.params
    const checkList = new CheckList()

    pageContext.sections = await checkList.buildSections(request.app.data)

    if (pdfAction === 'pdf-download') {
      const result = await pdf.createPDF(pageContext.sections, application)

      return h.response(result)
        .type('application/pdf')
        .header('Content-type', 'application/pdf')
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const pageContext = this.createPageContext(h)
    const checkList = new CheckList()
    pageContext.sections = await checkList.buildSections(request.app.data)

    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { application } = context

    application.declaration = true

    await application.save(request.app.data)

    return this.redirect({ h })
  }
}
