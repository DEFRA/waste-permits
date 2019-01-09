'use strict'

const BaseEntity = require('./base.entity')

const mapping = [
  { field: 'optionName', dynamics: 'defra_option' },
  { field: 'shortName', dynamics: 'defra_shortname', encode: true }
]

class ApplicationQuestionOption extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_applicationquestionoptions'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return mapping
  }

  static buildQuery (questionCode) {
    return `
      <fetch>
        <entity name="defra_applicationquestionoption">
          <attribute name="defra_option"/>
          <attribute name="defra_shortname"/>
          <filter>
            <condition attribute="statecode" operator="eq" value="0"/>
          </filter>
          <link-entity name="defra_applicationquestion" from="defra_applicationquestionid" to="defra_applicationquestion">
            <filter>
              <condition attribute="defra_shortname" operator="eq" value="${questionCode}"/>
            </filter>
          </link-entity>
        </entity>
      </fetch>
      `.replace(/\n\s+/g, '')
  }

  static async listOptionsForQuestion (context, questionCode) {
    return this.listUsingFetchXml(context, this.buildQuery(questionCode))
  }
}

ApplicationQuestionOption.setDefinitions()

module.exports = ApplicationQuestionOption
