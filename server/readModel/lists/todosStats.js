'use strict';

const fields = {
  notedAt: { initialState: 0 },
  tickedOffAt: { initialState: 0 },
  tickedOff: false
};

const when = {
  'planning.todo.noted' (todosStats, event, mark) {
    todosStats.add({
      id: event.aggregate.id,
      notedAt: event.metadata.timestamp
    });

    mark.asDone();
  },

  'planning.todo.tickedOff' (todosStats, event, mark) {
    todosStats.update({
      where: { id: event.aggregate.id },
      set: {
        tickedOffAt: event.metadata.timestamp,
        tickedOff: true
      }
    });

    mark.asDone();
  }
};

module.exports = { fields, when };
