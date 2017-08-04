module.exports = [{
  method: ['GET'],
  path: '/task-list',
  handler: (request, reply) => {
    const context = {
      pageTitle: 'Waste Permits - Task List'
    }

    let token = request.server.methods.validateToken(request.state.session)
    if (!token) {
      // Redirect off an error screen
      return reply.redirect('/error')
    }

    // TODO Get the task list data from the persistence layer
    return reply
      .view('taskList', context)
      .state('session', { token: token })
  }
}]
