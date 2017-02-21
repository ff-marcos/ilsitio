/* globals module, require */
module.exports = function (grunt) {
  'use strict';
  // Matchdep saves you from adding all your grunt packages manually.
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  var counter = 0;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Empty the vendor directories.
    clean: {
      css: {
        src: [
          '_/source/styles/vendor/*.css'
        ],
      },
      js: {
        src: [
          '_/source/scripts/vendor/*.js'
        ]
      }
    },
    // Concatenates css/js files.
    concat: {
      css: {
        files: {
          '_/css/<%= pkg.name %>.css': [
            '_/source/styles/vendor/**/*.css',
            '_/source/styles/style.css',
          ]
        }
      },
      js: {
        files: {
          '_/js/<%= pkg.name %>.js': [
            '_/source/scripts/vendor/**/*.js',
            '_/source/scripts/script.js'
          ]
        }
      }
    },
    // Copy vendor source files to build dir.
    copy: {
      css: {},
      js: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: './bower_components',
            src: [
              'foundation-sites/dist/js/plugins/foundation.core.min.js',
              'foundation-sites/dist/js/plugins/foundation.util.mediaQuery.min.js',
              'foundation-sites/dist/js/plugins/foundation.util.timerAndImageLoader.min.js',
              'foundation-sites/dist/js/plugins/foundation.util.triggers.min.js',
              'foundation-sites/dist/js/plugins/foundation.equalizer.min.js'
            ],
            dest: './_/source/scripts/vendor/',
            rename: function (dest, src) {
              var num = counter++;
              return dest + src.replace('foundation', num + '_foundation');
            }
          }
        ]
      }
    },
    // Minifies css.
    cssmin: {
      build: {
        files: {
          '_/css/<%= pkg.name %>.min.css': ['_/css/<%= pkg.name %>.css']
        }
      }
    },
    // Copy files down via cURL.
    curl: {
      '.sass-lint.yml': 'https://bitbucket.org/!api/2.0/snippets/freshform/ookRr/2fe1f38177f192a851d5b276a5c09f97c56c70c5/files/.sass-lint.yml',
      '.jshintrc': 'https://bitbucket.org/!api/2.0/snippets/freshform/M5bGg/1a1ff185fe0b95f87459c70165b36f2793a4af69/files/.jshintrc'
    },
    // Lints js files.
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['Gruntfile.js', '_/source/scripts/*.js']
    },
    // Apply CSSNext to compiled CSS.
    postcss: {
      options: {
        map: {
          inline: false,
          annotation: '_/css/'
        },
        processors: [
          require('postcss-cssnext')({browsers: 'last 2 versions, ie >= 9, and_chr >= 2.3, ios_saf >= 8.4'})
        ]
      },
      dist: {
        src: '_/css/*.css'
      }
    },
    // Adds sass partials to style.scss.
    sass_globbing: {
      build: {
        files: {
          '_/source/styles/sass/style.scss': '_/source/styles/sass/partials/**/*.scss'
        },
        options: {
          signature: '// generated with grunt-sass-globbing',
          useSingleQuotes: true
        }
      }
    },
    // Compiles sass.
    sass: {
      options: {
        includePaths: ['bower_components/foundation-sites/scss'],
        outputStyle: 'nested'
      },
      build: {
        files: {
          '_/source/styles/style.css': '_/source/styles/sass/style.scss'
        }
      }
    },
    // Lints sass files.
    sasslint: {
      options: {
        configFile: '.sass-lint.yml'
      },
      target: [
        '_/source/styles/sass/style.scss',
        '_/source/styles/sass/**/*.scss'
      ]
    },
    // Compresses js files.
    uglify: {
      options: {
        mangle: false
      },
      build: {
        files: {
          '_/js/<%= pkg.name %>.min.js': ['_/js/<%= pkg.name %>.js']
        }
      }
    },
    // Watch monitors files and performs tasks.
    watch: {
      css: {
        files: ['_/source/styles/**/*.scss', '_/source/styles/*/*.css', '_/source/styles/drupal.css'],
        tasks: ['buildCSS']
      },
      js: {
        files: ['Gruntfile.js', '_/source/scripts/**/*.js'],
        tasks: ['buildJS']
      }
    }
  });

  grunt.registerTask('default', ['curl', 'clean', 'sass_globbing', 'sasslint', 'sass', 'jshint', 'copy', 'concat', 'postcss']);
  grunt.registerTask('buildCSS', ['sass_globbing', 'sasslint', 'sass', 'concat:css', 'postcss']);
  grunt.registerTask('buildJS', ['jshint', 'concat:js']);
  grunt.registerTask('buildRelease', ['default', 'uglify', 'cssmin']);
};
