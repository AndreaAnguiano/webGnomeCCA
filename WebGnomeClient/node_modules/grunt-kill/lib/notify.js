module.exports = function (succeeded, nxProcesses, permissionErrors, grunt) {
  if (succeeded === 0 && (nxProcesses + permissionErrors) > 0) {
    grunt.fail.fatal('Unable to kill any processes.');
  }
  else if (permissionErrors > 0) {
    grunt.fail.warn('Insufficient permission to terminate ' + permissionErrors + ' of the specified processes.');
  }
  else {
    grunt.log.ok('Terminated ' + succeeded + ' processes, ' + nxProcesses + ' skipped.');
  }
};
