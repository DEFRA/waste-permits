const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

lab.test('returns true when 1 + 1 equals 2', (done) => {
  Code.expect(1 + 1).to.equal(2)

  // How to expect the length of some item
  Code.expect('something').to.have.length(9)

  done()
})
