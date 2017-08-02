const Hapi = require('hapi')
const server = new Hapi.Server()

server.connection({
  port: 8000
})

server.register([require('inert'), require('vision')], (err) => {
  if (err) {
    throw err
  }
    // load views
  server.views(require('./src/views'))

    // load routes
  server.route(require('./src/routes/public'))
  server.route(require('./src/routes/default'))
})

// Start the server
server.start((err) => {
  if (err) {
    throw err
  }
  console.info('Server running at:', server.info)
})

module.exports = server
