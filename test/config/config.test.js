'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const config = require('../../src/config/config')

lab.beforeEach((done) => {
  done()
})

lab.afterEach((done) => {
  done()
})

// A note for the initiated (and why we test the properties in the first test
// and the functions in the second) is that modules are cached the first time
// they are loaded. This means (among other things) that every call to
// `require('foo')` will get exactly the same object returned, if it would
// resolve to the same file.
// http://nodejs.org/docs/latest/api/modules.html#caching
//
// As config is just a module and not a class, once it's required it will not
// change, even if we amend the value of the env var http_proxy and call
// `require('config')` again in a subsequent test.
//
// Hence our first test tests that the module works as expected in our local and
// CI environment. The next tests the functions that are used to determine what
// the host and port will be using a value we expect to extract in our other
// environments
lab.experiment('Config tests:', () => {
  lab.test('config correctly handles the http_proxy env var not being set', (done) => {
    Code.expect(config.http_proxy).to.be.undefined()
    Code.expect(config.http_proxy_port).to.be.undefined()

    done()
  })

  lab.test('config correctly extracts the address and port from the http_proxy env var', (done) => {
    // This is the format we expect based on our current environments
    const fakeProxyEnvVar = 'http://instance.cloudprovider.myorg.net:4321'
    Code.expect(config.getAddress(fakeProxyEnvVar)).to.equal('instance.cloudprovider.myorg.net')
    Code.expect(config.getPort(fakeProxyEnvVar)).to.equal(4321)

    done()
  })
})
