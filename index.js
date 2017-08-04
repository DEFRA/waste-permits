const Hapi = require('hapi')
const server = new Hapi.Server()

server.connection({
  port: 8000
})

server.register([require('inert'), require('vision')], (err) => {
  if (err) {
    throw err
  }

  // Load views
  server.views(require('./src/views'))

  // TODO load in routes using wildcard
  // Load routes
  server.route(require('./src/routes/public'))
  server.route(require('./src/routes/default'))
  server.route(require('./src/routes/taskList'))
  server.route(require('./src/routes/site'))
})

// Start the server
server.start((err) => {
  if (err) {
    throw err
  }
  console.info('Server running at:', server.info)
})

module.exports = server
