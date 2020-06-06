grunt-kill
==========

Validate processes from grunt.

Requires grunt 0.4

# Install

    npm install grunt-kill --save-dev

Add the following to load the task into your Gruntfile:

    grunt.loadNpmTasks('grunt-kill');

# Configure

`grunt-kill` is a multi-task, meaning you can create targets with different configurations.

There are 4 ways you can specify the pid to kill:

* Specify the pid directly with the pid option
* Give a function with the pid option which returns the pid
* Point to a pid file with the pid option
* Use the standard grunt source file settings to specify pid files.

Examples specifying a pidfile in your Gruntfile:

    kill: {
      myService: {
        src: [ 'my-service.pid' ]
      },
      secondary: {
        pid: 'secondary.pid'
      }
    }

Example specifying a pid directly:

    kill: {
      simpleService: {
        pid: 5741
      }
    }

Example with a function:

    kill: {
      functionCallExample: {
        pid: function () {
          return locateMyService().getPid();
        }
      }
    }

Only synchronous functions are supported at this time.

# Running Tests

Most of the code in this plugin has unit tests.  To run them all to check for regressions, run just `grunt`, like so:

    $ grunt

This will lint all of the JavaScript source files, the `Gruntfile` itself, and run all unit tests.

# Release History

* 2015-08-23   v1.0.0   First official release
