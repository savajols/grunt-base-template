module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: grunt.file.readJSON('config_path.json'),

    // JS HINT
    jshint: {
      all: ['Gruntfile.js', '<%= config.app_path %>/**/*.js' ],
      options: {
          force: true,
          reporter: require('jshint-stylish')
      }
    },

    // FOR DEV APP FILES AND VENDOR FILES JS
    uglify: {
        options: {
            mangle: true,
            sourceMap:true,
            compress: true,
            preserveComments: false
        },
        dev_vendor:{
            options: {
              compress: {
                  warnings: false
              }
            },
            files: {
                '<%= config.public_path %>/<%= config.js_dir %>/vendor.js':
                    [
                        // BEFORE

                        // ALL
                        '<%= config.vendor_path %>/**/*.js',
                        '!<%= config.vendor_path %>/**/_*.js', // IGNORED

                        // AFTER
                        '<%= config.vendor_path %>/require.js'
                    ]
            }
        },
        dev_app:{
            files: {
                "<%= config.public_path %>/<%= config.js_dir %>/app.js":
                    [
                        '<%= config.app_path %>/**/*.js',
                        '!<%= config.app_path %>/**/_*.js' // IGNORED
                    ]
            }
        },
        // ONLY VENDORS
        prod: {
            options: {
                compress: {
                    drop_console: true,
                    warnings: false
                }
            },
            files: {
                '<%= config.public_path %>/<%= config.js_dir %>/vendor.js':
                    [
                        // BEFORE

                        // ALL
                        '<%= config.vendor_path %>/**/*.js',
                        '!<%= config.vendor_path %>/**/_*.js', // IGNORED
                        '!<%= config.vendor_path %>/require.js'

                        // AFTER
                    ]
            }
        }
    },

    // APP FILES FOR BUILD ONLY
    requirejs: {
      compile: {
        options: {
          baseUrl: "<%= config.app_path %>",
          include: "<%= config.require_include_modules %>",
          name: "../vendor/_almond", // assumes a production build using almond
          out: "<%= config.public_path %>/<%= config.js_dir %>/app.js",
          optimize: "uglify2",
          generateSourceMaps: true,
          preserveLicenseComments: false,
          findNestedDependencies: true
        }
      }
    },

    // SASS FILES
    sass: {
      dist: {
        options: {
          sourcemap:true
        },
        files: [{
          expand: true,
          cwd: '<%= config.sass_path %>',
          src: ['**/*.scss'],
          dest: '<%= config.public_path %>/<%= config.css_dir %>/',
          ext: '.css'
        }]
      }
    },

    // WEB SERVER HTML
    connect: {
      dev: {
        options:{
          protocol: "<%= config.protocole %>",
          hostname: "<%= config.hostname %>",
          port: "<%= config.port %>",
          base: "<%= config.public_path %>",
          livereload: true,
          open: true
        }
      }
    },

    // WEB SERVER PHP
    php: {
      dev: {
          options: {
          base: "<%= config.public_path %>",
            keepalive: true,
            open: true,
            hostname: "<%= config.hostname %>",
            port: "<%= config.port %>"
          }
      }
    },

    // WATCHER
    watch: {
      config: {
        files: ['Gruntfile.js', "config_path.json"],
        options: {
          reload: true
        },
      },
      scripts: {
        files: ['<%= config.app_path %>/**/*.js'],
        tasks: ['jshint','uglify:dev_app'],
        options: {
          spawn: false,
          livereload: true
        },
      },
      sass: {
        files: ['<%= config.sass_path %>/**/*.scss'],
        tasks: ['sass']
      },
      css: {
        files: ['<%= config.public_path %>/**/*.css'],
        options:{
          // To use with external server, copy/paste the next script tag
          // <script src="//localhost:35729/livereload.js"></script>
          livereload: true
        }
      },
      vendor: {
        files: ['<%= config.vendor_path %>/**/*.js'],
        tasks: ['uglify:dev_vendor'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    }
  });

  // LOAD GRUNT NPM TASKS
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-php');


  // REGISTER TASKS
  // $ grunt // Will trigger "degault" task
  // $ grunt compile // Will trigger "compile" task
  // which perform "jshint", "sass", "uglify", "requirejs" tasks

  grunt.registerTask('compile', ["jshint", "uglify:prod", "requirejs", "sass"]);
  grunt.registerTask('watch_tasks', ["jshint", "uglify:dev_vendor", "uglify:dev_app", "sass"]);
  grunt.registerTask('watch_php', ["watch_tasks", "php", "watch"]);
  grunt.registerTask('watch_server', ["watch_tasks", "connect", "watch"]);
  grunt.registerTask('watch_no_server', ["watch_tasks", "watch"]);
  grunt.registerTask('default', ["watch_server"]);

};
