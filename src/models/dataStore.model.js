const BaseModel = require('./base.model')
const ApplicationData = require('../persistence/entities/applicationData.entity')

module.exports = class DataStore extends BaseModel {
  static get fields () {
    return {
      id: { entity: ApplicationData },
      applicationId: { entity: ApplicationData },
      data: { entity: ApplicationData }
    }
  }

  static async get (context, id) {
    const { applicationId } = context
    const applicationData = id ? await ApplicationData.getById(context, id) : await ApplicationData.getBy(context, { applicationId })
    const data = applicationData && applicationData.data ? JSON.parse(applicationData.data) : {}
    id = applicationData ? applicationData.id : id
    const dataStore = new DataStore({
      id,
      applicationId,
      data
    })
    return dataStore
  }

  async save (context) {
    const { applicationId } = context
    let { id, data } = this

    const applicationData = id ? await ApplicationData.getById(context, id) : new ApplicationData({ applicationId })

    if (data) {
      applicationData.data = JSON.stringify(data)
    }

    await applicationData.save(context)

    return this.id
  }
}
