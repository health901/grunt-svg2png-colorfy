/*
 * grunt-svg2png-colorfy
 * https://github.com/netbek/grunt-svg2png-colorfy
 *
 * Copyright (c) 2015 Hein Bekker
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs-extra');

exports.svg2png_colorfy = {
  test1: function(test) {
    test.ok(
      fs.existsSync('test/files/dest/icon-0001-home-blue.png'),
      'PNG "icon-0001-home-blue.png" should exist'
    );
    test.done();
  }
};
