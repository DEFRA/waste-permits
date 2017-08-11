'use strict'

module.exports = function (request, reply) {
  const context = {
    pageTitle: 'Waste Permits - Error'
  }

  return reply.view('error', context)
}
