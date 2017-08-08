const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

lab.experiment('Trivial test examples:', () => {
  lab.test('Can add two numbers together', (done) => {
    Code.expect(1 + 1).to.equal(2)
    done()
  })

  lab.test('Can test the length of something', (done) => {
    Code.expect('something').to.have.length(9)
    done()
  })
})
