"use strict";

var collectPidFiles = require('./collect-pid-files');

module.exports = function findPids(task, grunt) {
  if (task.filesSrc != null && task.filesSrc.length > 0) {
    return collectPidFiles(task.filesSrc, grunt);
  }
  else if (task.options.pid != null) {
    return handlePidOption(task.options.pid, grunt);
  }
  else {
    return [];
  }
};

function handlePidOption(pidSpecified, grunt) {
  if (typeof pidSpecified === 'string') {
    return handlePidOptionAsString(pidSpecified, grunt);
  }
  else if (typeof pidSpecified === 'function') {
    return [ pidSpecified() ];
  }
  else if (!isNaN(pidSpecified)) {
    return [ pidSpecified ];
  }
}

function handlePidOptionAsString(pidSpecified, grunt) {
  var pid = parseInt(pidSpecified, 10);

  if (isNaN(pid)) {
    return collectPidFiles([ pidSpecified ], grunt);
  }
  else {
    return [ pid ];
  }
}
