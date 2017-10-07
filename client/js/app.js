(function (view) {
  'use strict';

  wolkenkit.connect({ host: 'local.wolkenkit.io', port: 3000 }).
    then(todoMvc => {
      const state = {
        todos: [],
        currentTodoId: undefined,
        currentFilter: 'all',
        averageVelocity: undefined
      };

      view.on('todo.note', title => {
        todoMvc.planning.todo().note({
          title
        }).
          failed(err => {
            throw err;
          });
      }).
        on('todo.tickOff', id => {
          todoMvc.planning.todo(id).tickOff().
            failed(err => {
              throw err;
            });
        }).
        on('todo.resume', id => {
          todoMvc.planning.todo(id).resume().
            failed(err => {
              throw err;
            });
        }).
        on('todo.discard', id => {
          todoMvc.planning.todo(id).discard().
            failed(err => {
              throw err;
            });
        }).
        on('todo.archive', id => {
          todoMvc.planning.todo(id).archive().
            failed(err => {
              throw err;
            });
        }).
        on('todo.startEdit', id => {
          state.currentTodoId = id;

          view.render(state);
        }).
        on('todo.edit', options => {
          const { id, newTitle } = options;

          const changedTodo = state.todos.find(todo => todo.id === id);

          if (!changedTodo || changedTodo.title === newTitle) {
            state.currentTodoId = undefined;
            view.render(state);

            return;
          }

          todoMvc.planning.todo(id).edit({
            title: newTitle
          }).
            failed(err => {
              throw err;
            }).
            await('edited', () => {
              state.currentTodoId = undefined;
              view.render(state);
            });
        }).
        on('todo.toggleAll', checked => {
          state.todos.forEach(todo => {
            if (checked && !todo.isTickedOff) {
              todoMvc.planning.todo(todo.id).tickOff().
                failed(err => {
                  throw err;
                });
            }
            if (!checked && todo.isTickedOff) {
              todoMvc.planning.todo(todo.id).resume().
                failed(err => {
                  throw err;
                });
            }
          });
        }).
        on('todo.clearCompleted', () => {
          state.todos.forEach(todo => {
            if (todo.isTickedOff) {
              todoMvc.planning.todo(todo.id).archive().
                failed(err => {
                  throw err;
                });
            }
          });
        }).
        on('filter.change', newFilter => {
          state.currentFilter = newFilter;
          view.render(state);
        });

      todoMvc.lists.todos.readAndObserve().
        failed(err => {
          throw err;
        }).
        started(todos => {
          state.todos = todos;
          view.render(state);
        }).
        updated(todos => {
          state.todos = todos;
          view.render(state);
        });

      const calculateAverageVelocity = function (todos) {
        if (todos.length === 0) {
          return;
        }

        const sum = todos.
          map(todo => todo.tickedOffAt - todo.notedAt).
          reduce((prev, curr) => prev + curr);

        return (sum / todos.length / 1000).toFixed(1);
      };

      todoMvc.lists.todosStats.readAndObserve({
        where: { tickedOff: true }
      }).
        failed(err => {
          throw err;
        }).
        started(todos => {
          state.averageVelocity = calculateAverageVelocity(todos);
          view.render(state);
        }).
        updated(todos => {
          state.averageVelocity = calculateAverageVelocity(todos);
          view.render(state);
        });

      view.initialize();
    }).
      catch(err => {
        throw err;
      });
})(window.view);
