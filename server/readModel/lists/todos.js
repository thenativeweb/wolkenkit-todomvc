'use strict';

const fields = {
  title: { initialState: '', fastLookup: true },
  isTickedOff: { initialState: false }
};

const when = {
  'planning.todo.noted' (todos, event) {
    todos.add({
      id: event.aggregate.id,
      timestamp: event.metadata.timestamp,
      title: event.data.title
    });
  },

  'planning.todo.edited' (todos, event) {
    todos.update({
      where: { id: event.aggregate.id },
      set: { title: event.data.title }
    });
  },

  'planning.todo.tickedOff' (todos, event) {
    todos.update({
      where: { id: event.aggregate.id },
      set: { isTickedOff: true }
    });
  },

  'planning.todo.resumed' (todos, event) {
    todos.update({
      where: { id: event.aggregate.id },
      set: { isTickedOff: false }
    });
  },

  'planning.todo.archived' (todos, event) {
    todos.remove({
      where: { id: event.aggregate.id }
    });
  },

  'planning.todo.discarded' (todos, event) {
    todos.remove({
      where: { id: event.aggregate.id }
    });
  }
};

module.exports = { fields, when };
