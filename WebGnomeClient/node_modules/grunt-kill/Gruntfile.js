/*global module:false*/
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    jshint: {
      options: {
        node: true,
        eqnull: true,
        globals: {
          describe: true,
          it: true,
          before: true,
          after: true,
          beforeEach: true,
          afterEach: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      tasks: {
        src: [ 'tasks/**/*.js', 'lib/**/*.js' ]
      },
      tests: {
        src: [ 'test/**/*.js' ]
      }
    },

    mochaTest: {
      src: 'test/*.js'
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', [ 'jshint', 'mochaTest' ]);

};
