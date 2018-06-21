'use strict';

const { only } = require('wolkenkit-command-tools');

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
    only.ifCommandValidatedBy({
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1 }
      },
      required: [ 'title' ]
    }),
    (todo, command) => {
      todo.events.publish('noted', {
        title: command.data.title
      });
    }
  ],

  edit: [
    only.ifExists(),
    only.ifCommandValidatedBy({
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1 }
      },
      required: [ 'title' ]
    }),
    (todo, command) => {
      if (todo.state.title === command.data.title) {
        return command.reject('New title is not different from the old one.');
      }

      todo.events.publish('edited', {
        title: command.data.title
      });
    }
  ],

  tickOff: [
    only.ifExists(),
    (todo, command) => {
      if (todo.state.isTickedOff) {
        return command.reject('Todo was already ticked off.');
      }

      todo.events.publish('tickedOff');
    }
  ],

  resume: [
    only.ifExists(),
    (todo, command) => {
      if (!todo.state.isTickedOff) {
        return command.reject('Todo was not yet ticked off.');
      }

      todo.events.publish('resumed');
    }
  ],

  archive: [
    only.ifExists(),
    (todo, command) => {
      if (todo.state.isArchived) {
        return command.reject('Todo was already archived.');
      }
      if (!todo.state.isTickedOff) {
        return command.reject('Todo was not yet ticked off.');
      }

      todo.events.publish('archived');
    }
  ],

  discard: [
    only.ifExists(),
    (todo, command) => {
      if (todo.state.isDiscarded) {
        return command.reject('Todo was already discarded.');
      }
      if (todo.state.isTickedOff) {
        return command.reject('Todo was already ticked off.');
      }

      todo.events.publish('discarded');
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
