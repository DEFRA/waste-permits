'use strict'

const BaseEntity = require('./base.entity')

class Task extends BaseEntity {
  static get dynamicsEntity () {
    return 'defra_applicationtaskdefinitions'
  }

  static get readOnly () {
    return true
  }

  static get mapping () {
    return [{ field: 'shortName', dynamics: 'defra_shortname' }]
  }

  static async getAvailableTasks (context) {
    const { applicationId } = context
    const query = `
          <fetch distinct="true">
              <entity name="defra_applicationtaskdefinition">
                  <attribute name="defra_shortname"/>
                  <filter>
                      <condition attribute="statecode" operator="eq" value="0"/>
                  </filter>
                  <link-entity name="defra_itemapplicationtaskdefinition" from="defra_applicationtaskdefinitionid" to="defra_applicationtaskdefinitionid" link-type="inner" alias="link">
                      <filter type="and">
                          <condition attribute="statecode" operator="eq" value="0"/>
                      </filter>
                      <link-entity name="defra_item" from="defra_itemid" to="defra_itemid" link-type="inner" alias="item">
                          <filter type="and">
                              <condition attribute="statecode" operator="eq" value="0"/>
                          </filter>
                          <link-entity name="defra_applicationline" from="defra_itemid" to="defra_itemid" link-type="inner" alias="line">
                              <filter type="and">
                                  <condition attribute="statecode" operator="eq" value="0"/>
                                  <condition attribute="defra_applicationid" operator="eq" value="${applicationId}"/>
                              </filter>
                          </link-entity>
                      </link-entity>
                  </link-entity>
              </entity>
          </fetch>
          `
    return this.listUsingFetchXml(context, query)
  }
}

Task.setDefinitions()

module.exports = Task
