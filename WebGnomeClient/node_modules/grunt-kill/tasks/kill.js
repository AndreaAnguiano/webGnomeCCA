var findPids = require('../lib/find-pids');
var notify = require('../lib/notify');

module.exports = function (grunt) {
  "use strict";

  grunt.registerMultiTask("kill", "Terminate a process.", function () {
    var pids = findPids(this, grunt);

    if (pids != null) {
      var succeeded = 0;
      var nxProcesses = 0;
      var permissionErrors = 0;

      pids.forEach(function (pid) {
        grunt.log.debug('Killing process ' + pid);

        try {
          process.kill(pid, 'SIGTERM');
          succeeded++;
        }
        catch (e) {
          if (e.code === 'ESRCH') {
            nxProcesses++;
          }
          else if (e.code === 'EPERM') {
            permissionErrors++;
          }
        }

        grunt.log.debug('Killed process ' + pid);
      });

      notify(succeeded, nxProcesses, permissionErrors, grunt);
    }
  });
};
