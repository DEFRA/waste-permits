const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../index')

lab.experiment('Site page tests', () => {
  lab.test('POST /site success redirects to the Task List route', (done) => {
    const request = {
      method: 'POST',
      url: '/site',
      headers: {}
    }
    // request.headers['Set-Cookie'] = 'COOKIE_HERE'

    request.payload = {
      siteName: 'My Site'
    }

    server.methods.validateToken = () => {
      return 'my_token'
    }

    server.inject(request, (res) => {
      // console.log('Result: ' + res.result)
      // console.log('Headers: ' + Object.keys(res.headers))
      // console.log('Cookie: ' + res.headers['set-cookie'])
      // console.log(res.headers['location'] === '/task-list')
      // console.log(res)

      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/task-list')

      done()
    })
  })
})
