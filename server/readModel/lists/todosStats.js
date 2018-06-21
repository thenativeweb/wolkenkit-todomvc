'use strict';

const fields = {
  notedAt: { initialState: 0 },
  tickedOffAt: { initialState: 0 },
  tickedOff: false
};

const projections = {
  'planning.todo.noted' (todosStats, event) {
    todosStats.add({
      id: event.aggregate.id,
      notedAt: event.metadata.timestamp
    });
  },

  'planning.todo.tickedOff' (todosStats, event) {
    todosStats.update({
      where: { id: event.aggregate.id },
      set: {
        tickedOffAt: event.metadata.timestamp,
        tickedOff: true
      }
    });
  }
};

module.exports = { fields, projections };
