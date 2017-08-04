module.exports = [{
  method: ['GET'],
  path: '/task-list',
  handler: (request, reply) => {
    const context = {
      pageTitle: 'Waste Permits - Task List'
    }

    // TODO Get the task list data from the persistence layer
    reply.view('taskList/taskList', context)
  }
}]
