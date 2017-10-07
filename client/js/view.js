(function () {
  'use strict';

  const handlers = {};

  const view = {
    elements: {
      footer: document.querySelector('#footer'),
      newTodo: document.querySelector('#new-todo'),
      todoForm: document.querySelector('#todo-form'),
      todoList: document.querySelector('#todo-list'),
      todoStats: document.querySelector('#todo-stats'),
      toggleAll: document.querySelector('#toggle-all')
    },

    initialize () {
      window.addEventListener('hashchange', view.handle.hashChanged);
      view.elements.todoForm.addEventListener('submit', view.handle.todoFormSubmitted);
      view.elements.todoList.addEventListener('click', view.handle.todoListClicked);
      view.elements.todoList.addEventListener('dblclick', view.handle.todoListDoubleClicked);
      view.elements.todoList.addEventListener('blur', view.handle.todoListBlurred, true);
      view.elements.todoList.addEventListener('submit', view.handle.todoListSubmitted);
      view.elements.toggleAll.addEventListener('change', view.handle.toggleAllChanged);
      view.elements.footer.addEventListener('click', view.handle.footerClicked);

      /*
      * Trigger the hashChanged handler so the hash from the
      * url can be picked up after initally loading the page.
      */
      view.handle.hashChanged();
    },

    on (eventName, handler) {
      if (!eventName) {
        throw new Error('Event name is missing.');
      }

      if (typeof handler !== 'function') {
        throw new Error('Event handler is not a function.');
      }

      if (!handlers[eventName]) {
        handlers[eventName] = [];
      }

      handlers[eventName].push(handler);

      return view;
    },

    emit (eventName, eventData) {
      if (Array.isArray(handlers[eventName])) {
        handlers[eventName].forEach(handler => handler(eventData));
      }
    },

    handle: {
      hashChanged () {
        const availableFilter = [ 'all', 'active', 'completed' ];
        let newFilter = document.location.hash.replace('#/', '');

        if (!newFilter) {
          newFilter = 'all';
        }

        if (!availableFilter.includes(newFilter)) {
          document.location.hash = '/all';
        }

        view.emit('filter.change', newFilter);
      },

      todoFormSubmitted () {
        const title = view.elements.newTodo.value.trim();

        if (!title) {
          return;
        }

        view.emit('todo.note', title);

        view.elements.newTodo.value = '';
      },

      todoListClicked (event) {
        const todo = view.getParent(event.target, '.todo');
        const id = todo.getAttribute('data-id');

        if (event.target.classList.contains('toggle')) {
          const checkbox = event.target;

          if (checkbox.checked === true) {
            view.emit('todo.tickOff', id);
          } else {
            view.emit('todo.resume', id);
          }
        } else if (event.target.classList.contains('destroy')) {
          if (todo.classList.contains('completed')) {
            view.emit('todo.archive', id);
          } else {
            view.emit('todo.discard', id);
          }
        }
      },

      todoListDoubleClicked (event) {
        const todo = view.getParent(event.target, '.todo');

        if (!todo) {
          return;
        }

        const id = todo.getAttribute('data-id');

        view.emit('todo.startEdit', id);

        setTimeout(() => {
          document.querySelector('.todo.editing .edit').select();
        });
      },

      todoListBlurred (event) {
        if (!event.target.classList.contains('edit')) {
          return;
        }

        const newTitle = event.target.value;
        const todo = view.getParent(event.target, '.todo');
        const id = todo.getAttribute('data-id');

        view.emit('todo.edit', { id, newTitle });
      },

      todoListSubmitted (event) {
        if (!event.target.classList.contains('edit-todo-form')) {
          return;
        }

        event.target.querySelector('.edit').blur();
      },

      toggleAllChanged (event) {
        const checked = event.target.checked;

        view.emit('todo.toggleAll', checked);
      },

      footerClicked (event) {
        if (event.target.matches('#clear-completed')) {
          view.emit('todo.clearCompleted');
        }
      }
    },

    getParent (element, selector) {
      for (; element && element !== document; element = element.parentNode) {
        if (element.matches(selector)) {
          return element;
        }
      }
    },

    renderTodoList (state) {
      if (!state) {
        throw new Error('State is missing.');
      }

      const { currentFilter, currentTodoId } = state;
      let { todos } = state;

      if (currentFilter !== 'all') {
        todos = todos.filter(todo => {
          if (currentFilter === 'completed') {
            return todo.isTickedOff === true;
          }

          return todo.isTickedOff === false;
        });
      }

      const html = todos.map(todo =>
        `<li data-id="${todo.id}" class="todo ${todo.isTickedOff ? 'completed' : ''} ${todo.id === currentTodoId ? 'editing' : ''}">
          <div class="view">
            <input class="toggle" type="checkbox" ${todo.isTickedOff ? 'checked' : ''}>
            <label>${todo.title}</label>
            <button class="destroy"></button>
          </div>
          <form class="edit-todo-form">
            <input class="edit" value="${todo.title}">
          </form>
        </li>`
      ).join('');

      view.elements.todoList.innerHTML = html;
    },

    renderFooter (state) {
      if (!state) {
        throw new Error('State is missing.');
      }

      const { currentFilter, todos } = state;

      const todoCount = todos.reduce((count, todo) => {
        if (!todo.isTickedOff) {
          return count + 1;
        }

        return count;
      }, 0);

      const html = `<span id="todo-count">
          <strong>${todoCount} items left</strong>
        </span>
        <ul id="filters">
          <li>
            <a class="${currentFilter === 'all' ? 'selected' : ''}" href="#/">All</a>
          </li>
          <li>
            <a class="${currentFilter === 'active' ? 'selected' : ''}" href="#/active">Active</a>
          </li>
          <li>
            <a class="${currentFilter === 'completed' ? 'selected' : ''}" href="#/completed">Completed</a>
          </li>
        </ul>
        <button id="clear-completed">Clear completed</button>
      `;

      view.elements.footer.innerHTML = html;
    },

    renderTodoStats (state) {
      const { averageVelocity } = state;

      if (!averageVelocity) {
        return;
      }

      const html = `<p>
          Congratulations, in average it took you ${averageVelocity} seconds to complete your todos!
        </p>`;

      view.elements.todoStats.innerHTML = html;
    },

    render (state) {
      view.renderTodoList(state);
      view.renderTodoStats(state);
      view.renderFooter(state);
    }
  };

  window.view = view;
})();
