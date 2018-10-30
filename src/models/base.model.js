module.exports = class BaseModel {
  constructor (data = {}) {
    const invalidFields = Object.keys(data).filter((field) => !this.constructor.fields[field])
    if (invalidFields.length) {
      throw new Error(`Unexpected fields when instantiating ${this.constructor.name}: ${invalidFields.join(', ')}`)
    }

    // Now populate all the valid entered fields
    Object.entries(data)
      .forEach(([field, value]) => {
        this[field] = value
      })
  }
}
