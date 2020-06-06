module.exports = function collectPidFiles(pidFiles, grunt) {
  return (pidFiles || []).filter(function (file) {
    return grunt.file.exists(file) && grunt.file.isFile(file);
  }).map(function (pidFile) {
    var pid = parseInt(grunt.file.read(pidFile, {
      encoding: 'utf8'
    }), 10);

    return isNaN(pid) ? undefined : pid;
  }).filter(function (pid) {
    return pid != null;
  });
};