/*
 * grunt-svg2png-colorfy
 * https://github.com/netbek/grunt-svg2png-colorfy
 *
 * Copyright (c) 2015 Hein Bekker
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		clean: {
			tests: ['tmp', 'test/files/dest']
		},
		svg2png_colorfy: {
			tests: {
				options: {
					colors: {
						blue: '#0000FF'
					}
				},
				files: [{cwd: 'test/files/src/', src: ['*.svg'], dest: 'test/files/dest/'}]
			}
		},
		nodeunit: {
			tests: ['test/*_test.js']
		}
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-svg2png');

	grunt.registerTask('test', ['clean', 'svg2png_colorfy', 'nodeunit']);

	grunt.registerTask('default', ['jshint', 'svg2png_colorfy']);

};
