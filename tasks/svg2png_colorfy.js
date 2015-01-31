/*
 * grunt-svg2png-colorfy
 * https://github.com/netbek/grunt-svg2png-colorfy
 *
 * Copyright (c) 2015 Hein Bekker
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var DirectoryColorfy = require('directory-colorfy');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');
var hash = require('object-hash');
var jobs = [];

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-svg2png');

	grunt.registerTask('svg2png_colorfy_png', ['svg2png:svg2png_colorfy']);

	grunt.registerTask('svg2png_colorfy_clean', 'Clean up after svg2png_colorfy', function () {
		jobs.forEach(function (job) {
			if (grunt.file.isDir(job.temp)) {
				grunt.file.delete(job.temp);
			}
		});
		jobs = [];
	});

	grunt.registerMultiTask('svg2png_colorfy', 'Grunt plugin to rasterize SVG to PNG images with different colors', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			temp: 'tmp'
		});

		var colors = options.colors;
		var colorNames = Object.keys(colors);

		if (colorNames.length < 1) {
			grunt.fatal('One or more colors are required');
			return;
		}

		var colorSuffix = '.colors-' + colorNames.join('-');
		var tempPath = path.resolve(options.temp);

		if (grunt.file.isPathCwd(tempPath)) {
			grunt.verbose.error();
			grunt.fatal('Cannot delete the current working directory.');
			return false;
		}
		else if (grunt.file.isDir(tempPath) && !grunt.file.isPathInCwd(tempPath)) {
			grunt.verbose.error();
			grunt.fatal('Cannot delete files outside the current working directory.');
			return false;
		}

		grunt.file.mkdir(tempPath);

		function copy (files) {
			files.forEach(function (f) {
				if (!f.src) {
					grunt.fatal('Src directory is required');
					return;
				}
				if (!f.dest) {
					grunt.fatal('Dest directory is required');
					return;
				}

				var jobId = hash.MD5(f);
				var jobPath = tempPath + '/' + jobId;

				grunt.file.mkdir(jobPath);

				var cwd = '';
				var options = {};

				if (f.cwd) {
					cwd = options.cwd = f.cwd;
				}

				var files = grunt.file.expand(options, f.src);

				files.forEach(function (file) {
					var srcPath = path.resolve(cwd + file);
					var destPath = jobPath + '/' + path.basename(srcPath).replace(/\.svg$/i, colorSuffix + '.svg');
					grunt.file.copy(srcPath, destPath);
				});

				jobs.push({
					src: f.src,
					dest: f.dest,
					temp: jobPath,
					dc: jobPath + '/dc'
				});
			});

			return jobs;
		}

		var copyAsync = async(function (files) {
			return await(copy(files));
		});

		/**
		 *
		 * @param {string} srcPath
		 * @param {string} destPath
		 * @param {object} options
		 * @returns {array}
		 */
		function colorfy (srcPath, destPath, options) {
			grunt.file.mkdir(destPath);
			var dc = new DirectoryColorfy(srcPath, destPath, options);
			return dc.convert();
		}

		var colorfyAsync = async(function (srcPath, destPath, options) {
			return await(colorfy(srcPath, destPath, options));
		});

		var colorfyJobsAsync = async(function (jobs) {
			var promises = [];

			jobs.forEach(function (set) {
				promises.push(colorfyAsync(set.temp, set.dc, {
					colors: colors
				}));
			});

			return await(promises);
		});

		copyAsync(this.files)
			.then(function (data) {
				return colorfyJobsAsync(jobs);
			})
			.then(function (data) {
				var config = grunt.config.get('svg2png');
				if (!_.isPlainObject(config)) {
					config = {};
				}

				config.svg2png_colorfy = {
					files: []
				};

				jobs.forEach(function (job) {
					config.svg2png_colorfy.files.push({
						cwd: job.dc + '/',
						src: '*.svg',
						dest: job.dest
					});
				});

				grunt.config.set('svg2png', config);

				grunt.task.run(['svg2png_colorfy_png', 'svg2png_colorfy_clean']);
			})
			.catch(function (err) {
				grunt.fatal(err);
			});
	});

};
