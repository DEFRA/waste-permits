'use strict'

const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const { MANAGEMENT_SYSTEM } = require('../dynamics').ApplicationQuestions
const { questionCode } = MANAGEMENT_SYSTEM

const EmasTemplate = fs.readFileSync(path.resolve('./src/views/partials/abbreviations/EMAS.html'), 'utf8')
const IsoTemplate = fs.readFileSync(path.resolve('./src/views/partials/abbreviations/ISO.html'), 'utf8')

module.exports = class ManagementSystemSelectController extends BaseController {
  static async _buildDescription (descriptionTemplate, id) {
    const EMAS = await Handlebars.compile(EmasTemplate)({ id })
    const ISO = await Handlebars.compile(IsoTemplate)({ id })
    return Handlebars.compile(descriptionTemplate)({ EMAS, ISO })
  }

  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const pageContext = this.createPageContext(h, errors)
    const { answerCode } = await ApplicationAnswer.getByQuestionCode(context, questionCode) || {}

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {}
      pageContext.formValues[questionCode] = answerCode
    }

    pageContext.questionCode = questionCode
    pageContext.managementSystems = await Promise.all(MANAGEMENT_SYSTEM.answers
      .map(async (answer, index) => {
        // Build the descriptions using the abbreviation partial templates
        const { description, id } = answer
        answer.description = await this.constructor._buildDescription(description, `${id}-${index}`)
        answer.selected = answerCode && answerCode === answer.id
        return answer
      }))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const applicationAnswer = new ApplicationAnswer({ questionCode })

    const answerCode = request.payload[questionCode]

    const managementSystem = MANAGEMENT_SYSTEM.answers
      .find((answer) => answer.id === answerCode)

    if (!managementSystem) {
      throw new Error(`Unexpected management system (${answerCode})`)
    }

    applicationAnswer.answerCode = answerCode

    await applicationAnswer.save(context)

    return this.redirect({ h })
  }
}
