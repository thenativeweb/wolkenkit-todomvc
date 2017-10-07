'use strict';

const fields = {
  title: { initialState: '', fastLookup: true },
  isTickedOff: { initialState: false }
};

const when = {
  'planning.todo.noted' (todos, event, mark) {
    todos.add({
      id: event.aggregate.id,
      timestamp: event.metadata.timestamp,
      title: event.data.title
    });

    mark.asDone();
  },

  'planning.todo.edited' (todos, event, mark) {
    todos.update({
      where: { id: event.aggregate.id },
      set: { title: event.data.title }
    });

    mark.asDone();
  },

  'planning.todo.tickedOff' (todos, event, mark) {
    todos.update({
      where: { id: event.aggregate.id },
      set: { isTickedOff: true }
    });

    mark.asDone();
  },

  'planning.todo.resumed' (todos, event, mark) {
    todos.update({
      where: { id: event.aggregate.id },
      set: { isTickedOff: false }
    });

    mark.asDone();
  },

  'planning.todo.archived' (todos, event, mark) {
    todos.remove({
      where: { id: event.aggregate.id }
    });

    mark.asDone();
  },

  'planning.todo.discarded' (todos, event, mark) {
    todos.remove({
      where: { id: event.aggregate.id }
    });

    mark.asDone();
  }
};

module.exports = { fields, when };
