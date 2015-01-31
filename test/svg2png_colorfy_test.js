/*
 * grunt-svg2png-colorfy
 * https://github.com/netbek/grunt-svg2png-colorfy
 *
 * Copyright (c) 2015 Hein Bekker
 * Licensed under the MIT license.
 */

'use strict';

var grunt = require('grunt');
var fs = require('fs');

exports.svg2png_colorfy = {
	test1: function (test) {
		fs.stat('test/files/dest/icon-0001-home-blue.png', function (err, stats) {
			test.ok(err === null && stats.isFile(), 'PNG "icon-0001-home-blue.png" should exist');
			test.done();
		});
	}
};
