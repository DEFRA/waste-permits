'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DrainageTypeDrain = require('../../../src/models/taskList/drainageTypeDrain.task')

const COMPLETENESS_PARAMETER = 'defra_surfacedrainagereq_completed'

lab.experiment('Task List: DrainageTypeDrain Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(DrainageTypeDrain.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })
})
