'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const CostTime = require('../../../src/models/taskList/costTime.task')

const COMPLETENESS_PARAMETER = 'defra_showcostandtime_completed'

lab.experiment('Task List: CostTime Model tests:', () => {
  lab.test(`completenessParameter is ${COMPLETENESS_PARAMETER}`, async () => {
    Code.expect(CostTime.completenessParameter).to.equal(COMPLETENESS_PARAMETER)
  })
})
