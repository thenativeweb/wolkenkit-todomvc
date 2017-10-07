'use strict';

const only = require('wolkenkit-command-tools').only;

const initialState = {
  title: undefined,
  isTickedOff: false,
  isArchived: false,
  isDiscarded: false,
  isAuthorized: {
    commands: {
      note: { forPublic: true },
      edit: { forPublic: true },
      tickOff: { forPublic: true },
      resume: { forPublic: true },
      archive: { forPublic: true },
      discard: { forPublic: true }
    },
    events: {
      noted: { forPublic: true },
      edited: { forPublic: true },
      tickedOff: { forPublic: true },
      resumed: { forPublic: true },
      archived: { forPublic: true },
      discarded: { forPublic: true }
    }
  }
};

const commands = {
  note: [
    only.ifNotExists(),
    only.ifValidatedBy({
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1 }
      },
      required: [ 'title' ]
    }),
    (todo, command, mark) => {
      todo.events.publish('noted', {
        title: command.data.title
      });

      mark.asDone();
    }
  ],

  edit: [
    only.ifExists(),
    only.ifValidatedBy({
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1 }
      },
      required: [ 'title' ]
    }),
    (todo, command, mark) => {
      if (todo.state.title === command.data.title) {
        return mark.asRejected('New title is not different from the old one.');
      }

      todo.events.publish('edited', {
        title: command.data.title
      });

      mark.asDone();
    }
  ],

  tickOff: [
    only.ifExists(),
    (todo, command, mark) => {
      if (todo.state.isTickedOff) {
        return mark.asRejected('Todo was already ticked off.');
      }

      todo.events.publish('tickedOff');

      mark.asDone();
    }
  ],

  resume: [
    only.ifExists(),
    (todo, command, mark) => {
      if (!todo.state.isTickedOff) {
        return mark.asRejected('Todo was not yet ticked off.');
      }

      todo.events.publish('resumed');

      mark.asDone();
    }
  ],

  archive: [
    only.ifExists(),
    (todo, command, mark) => {
      if (todo.state.isArchived) {
        return mark.asRejected('Todo was already archived.');
      }
      if (!todo.state.isTickedOff) {
        return mark.asRejected('Todo was not yet ticked off.');
      }

      todo.events.publish('archived');

      mark.asDone();
    }
  ],

  discard: [
    only.ifExists(),
    (todo, command, mark) => {
      if (todo.state.isDiscarded) {
        return mark.asRejected('Todo was already discarded.');
      }
      if (todo.state.isTickedOff) {
        return mark.asRejected('Todo was already ticked off.');
      }

      todo.events.publish('discarded');

      mark.asDone();
    }
  ]
};

const events = {
  noted (todo, event) {
    todo.setState({
      title: event.data.title
    });
  },

  edited (todo, event) {
    todo.setState({
      title: event.data.title
    });
  },

  tickedOff (todo) {
    todo.setState({
      isTickedOff: true
    });
  },

  resumed (todo) {
    todo.setState({
      isTickedOff: false
    });
  },

  archived (todo) {
    todo.setState({
      isArchived: true
    });
  },

  discarded (todo) {
    todo.setState({
      isDiscarded: true
    });
  }
};

module.exports = { initialState, commands, events };
