'use strict';

const roboter = require('roboter');

roboter.
  workOn('server').
  equipWith(task => {
    task('universal/analyze', {
      src: [ 'server/**/*.js', '!node_modules/**/*.js', '!coverage/**/*.js', '!client/vendor/**/*.js' ]
    });
  }).
  start();
