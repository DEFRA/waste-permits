'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const StandardRuleType = require('../../src/models/standardRuleType.model')
const DynamicsDalService = require('../../src/services/dynamicsDal.service')

let sandbox
const context = { authToken: 'AUTH_TOKEN' }

const fakeStandardRuleType = {
  id: 'STANDARD_RULE_TYPE_ID',
  category: 'CATEGORY',
  hint: 'CATEGORY_HINT',
  categoryName: 'STANDARD_RULE_TYPE_NAME'
}

const fakeDynamicsRecord = (options = {}) => {
  const standardRuleType = Object.assign({}, fakeStandardRuleType, options)
  return {
    defra_name: standardRuleType.categoryName,
    defra_category: standardRuleType.category,
    defra_hint: standardRuleType.hint,
    defra_standardruletypeid: standardRuleType.id
  }
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(DynamicsDalService.prototype, 'search').value(() => {})
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('StandardRuleType Model tests:', () => {
  lab.test('list() method returns a list of StandardRuleType objects', async () => {
    const categories = ['Electrical', 'Metal', 'Plastic']
    DynamicsDalService.prototype.search = () => {
      return {
        value: categories.map((category) => fakeDynamicsRecord({ category }))
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const standardRuleList = await StandardRuleType.list(context)
    Code.expect(Array.isArray(standardRuleList)).to.be.true()
    Code.expect(standardRuleList.length).to.equal(categories.length)
    standardRuleList.forEach((standardRuleType, index) => {
      Code.expect(standardRuleType).to.equal(Object.assign({}, fakeStandardRuleType, { category: categories[index] }))
    })
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('getCategories() method returns a list of sorted online and offline Category objects', async () => {
    const categories = ['Electrical', 'Metal', 'Plastic']

    const offlineCategories = [
      { categoryName: 'Flood', category: 'Flood risk activities' },
      { categoryName: 'Radioactive', category: 'Radioactive substances for non-nuclear sites' },
      { categoryName: 'Water', category: 'Water discharges' }
    ]

    DynamicsDalService.prototype.search = () => {
      return {
        value: categories.map((category) => fakeDynamicsRecord({ category }))
      }
    }

    const spy = sinon.spy(DynamicsDalService.prototype, 'search')
    const standardRuleList = await StandardRuleType.getCategories(context)
    Code.expect(Array.isArray(standardRuleList)).to.be.true()
    Code.expect(standardRuleList.length).to.equal(categories.length + offlineCategories.length)
    let onlineIndex = 0
    let offlineIndex = 0
    standardRuleList.forEach((standardRuleType) => {
      if (categories.indexOf(standardRuleType.category) !== -1) {
        // Online category
        Code.expect(standardRuleType).to.equal({
          id: fakeStandardRuleType.id,
          categoryName: fakeStandardRuleType.categoryName.toLowerCase(),
          category: categories[onlineIndex],
          hint: fakeStandardRuleType.hint
        })
        onlineIndex++
      } else {
        // Offline category
        const { category, categoryName } = offlineCategories[offlineIndex]
        Code.expect(standardRuleType).to.equal({
          id: `offline-category-${categoryName.toLowerCase()}`,
          categoryName,
          category,
          hint: ''
        })
        offlineIndex++
      }
    })
    Code.expect(spy.callCount).to.equal(1)
  })

  lab.test('save() method should fail as this entity is readOnly', async () => {
    let error
    try {
      const standardRuleType = new StandardRuleType(fakeStandardRuleType)
      await standardRuleType.save()
    } catch (err) {
      error = err
    }
    Code.expect(error.message).to.equal('Unable to save defra_standardruletypes: Read only!')
  })
})
