'use strict'

const DynamicsDalService = require('../../services/dynamicsDal.service')
const BaseEntity = require('./base.entity')
const LoggingService = require('../../services/logging.service')

class ApplicationAnswer extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_applicationanswers'
  }

  static get mapping () {
    return [
      { field: 'questionCode', dynamics: '', actionField: 'QuestionCode' },
      { field: 'answerCode', dynamics: 'answeroption.defra_shortname', actionField: 'AnswerCode' },
      { field: 'answerText', dynamics: 'answeroption.defra_option', actionField: 'AnswerText' }
    ]
  }

  async save (context = {}, fields) {
    const { dynamicsEntity } = this.constructor
    if (!context) {
      const errorMessage = `Unable to save ${dynamicsEntity}: Context not supplied`
      LoggingService.logError(errorMessage)
      throw new Error(errorMessage)
    }

    const { applicationId } = context
    const dynamicsDal = new DynamicsDalService(context.authToken)
    try {
      // Call Dynamics save and return email action
      let action = `defra_applications(${applicationId})/Microsoft.Dynamics.CRM.defra_set_application_answer`
      await dynamicsDal.callAction(action, this.actionData)
    } catch (error) {
      LoggingService.logError(`Unable to call Dynamics Set Application Answer action: ${error}`)
      throw error
    }
  }

  async delete (context) {
    // Delete by clearing values
    delete this.answerCode
    delete this.answerText
    return this.save(context)
  }

  static buildQuery (context, questionCode) {
    const { applicationId } = context
    return `
          <fetch top="1000" no-lock="true">
            <entity name="defra_applicationanswer">
              <attribute name="defra_answer_option" />
              <attribute name="defra_applicationlineid" />
              <attribute name="defra_application" />
              <attribute name="defra_answertext" />
              <attribute name="defra_applicationanswerid" />
              <filter type="and">
                <condition attribute="defra_application" operator="eq" value="${applicationId}" />
                <condition attribute="statecode" operator="eq" value="0" />
              </filter>
              <link-entity name="defra_applicationquestion" from="defra_applicationquestionid" to="defra_question" link-type="inner" alias="question">
                <filter type="and">
                  <condition attribute="statecode" operator="eq" value="0" />
                  <condition attribute="defra_shortname" operator="eq" value="${questionCode}" />
                </filter>
              </link-entity>
              <link-entity name="defra_applicationquestionoption" from="defra_applicationquestionoptionid" to="defra_answer_option" link-type="outer" alias="answeroption">
                <attribute name="defra_option" />
                <attribute name="defra_shortname" />
                <filter>
                  <condition attribute="statecode" operator="eq" value="0" />
                </filter>
              </link-entity>
            </entity>
          </fetch>
          `.replace(/\n\s+/g, '')
  }

  static async getByQuestionCode (context, questionCode) {
    const answers = await this.listUsingFetchXml(context, this.buildQuery(context, questionCode))
    const answer = answers.pop()
    if (answer) {
      answer.questionCode = questionCode
    }
    return answer
  }
}

ApplicationAnswer.setDefinitions()

module.exports = ApplicationAnswer
