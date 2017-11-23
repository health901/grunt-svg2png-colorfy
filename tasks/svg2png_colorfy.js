/*
 * grunt-svg2png-colorfy
 * https://github.com/netbek/grunt-svg2png-colorfy
 *
 * Copyright (c) 2015 Hein Bekker
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var DirectoryColorfy = require('directory-colorfy');
var fs = require('fs-extra');
var hash = require('object-hash');
var path = require('path');
var Promise = require('grunt-promise').using('bluebird');
var streamifier = require('streamifier');
var svg2png = require('svg2png');

Promise.promisifyAll(fs);

/**
 *
 * @param   {String} svgPath Soure file path
 * @param   {String} pngDir Destination directory path
 * @returns {Promise}
 */
function makePng(svgPath, pngDir) {
  var extname = path.extname(svgPath);
  var basename = path.basename(svgPath, extname);
  var pngPath = path.join(pngDir, basename + '.png');

  return fs
    .readFileAsync(svgPath, 'utf-8')
    .then(function(data) {
      var buffer = new Buffer(data, 'utf-8');

      return svg2png(buffer);
    })
    .then(function(buffer) {
      return new Promise(function(resolve) {
        var writeStream = fs.createWriteStream(pngPath);

        writeStream.on('close', function() {
          resolve();
        });

        streamifier.createReadStream(buffer).pipe(writeStream);
      });
    });
}

module.exports = function(grunt) {
  grunt.registerMultiPromise(
    'svg2png_colorfy',
    'Grunt plugin to rasterize SVG to PNG images with different colors',
    function() {
      // Merge task-specific and/or target-specific options with these defaults.
      var options = this.options({
        temp: 'tmp'
      });

      var colors = options.colors;
      var colorNames = Object.keys(colors);
      var colorSuffix = '.colors-' + colorNames.join('-');
      var tempPath = path.resolve(options.temp);

      if (colorNames.length < 1) {
        grunt.fail.fatal('One or more colors are required');
      } else if (grunt.file.isPathCwd(tempPath)) {
        grunt.fail.fatal('Cannot delete the current working directory.');
      } else if (
        grunt.file.isDir(tempPath) &&
        !grunt.file.isPathInCwd(tempPath)
      ) {
        grunt.fail.fatal(
          'Cannot delete files outside the current working directory.'
        );
      }

      var files = this.files.reduce(function(result, file) {
        if (!file.src) {
          grunt.fail.fatal('Src directory is required');
        } else if (!file.dest) {
          grunt.fail.fatal('Dest directory is required');
        }

        var cwd = file.cwd || '';
        var dest = path.resolve(file.dest);
        var jobId = hash.MD5(file);
        var jobPath = path.join(tempPath, jobId);

        return result.concat(
          grunt.file.expand({cwd: cwd}, file.src).map(function(file) {
            var srcPath = path.resolve(cwd + file);
            var tmp1Path = path.join(
              jobPath,
              'tmp1',
              path.basename(srcPath).replace(/\.svg$/i, colorSuffix + '.svg')
            );
            var tmp2Path = path.join(jobPath, 'tmp2');

            return {
              jobId: jobId,
              src: srcPath,
              dest: dest,
              tmp1: tmp1Path,
              tmp2: tmp2Path
            };
          })
        );
      }, []);

      var destPaths = _.uniq(
        files.map(function(file) {
          return file.dest;
        })
      );

      var tmp2Paths = _.uniq(
        files.map(function(file) {
          return file.tmp2;
        })
      );

      var jobIds = _.uniq(
        files.map(function(file) {
          return file.jobId;
        })
      );

      return fs
        .mkdirpAsync(tempPath)
        .then(function() {
          return Promise.mapSeries(destPaths, function(destPath) {
            return fs.mkdirpAsync(destPath);
          });
        })
        .then(function() {
          return Promise.mapSeries(tmp2Paths, function(tmp2Path) {
            return fs.mkdirpAsync(tmp2Path);
          });
        })
        .then(function() {
          return Promise.mapSeries(files, function(file) {
            return fs.copyAsync(file.src, file.tmp1);
          });
        })
        .then(function() {
          return Promise.mapSeries(jobIds, function(jobId) {
            var tmp1Path = path.join(tempPath, jobId, 'tmp1');
            var tmp2Path = path.join(tempPath, jobId, 'tmp2');

            var dc = new DirectoryColorfy(tmp1Path, tmp2Path, {
              colors: colors
            });

            return dc.convert();
          });
        })
        .then(function() {
          return Promise.mapSeries(files, function(file) {
            var extname = path.extname(file.src);
            var basename = path.basename(file.src, extname);
            var tmp2Path = path.join(tempPath, file.jobId, 'tmp2');

            return Promise.mapSeries(colorNames, function(colorName) {
              var svgPath = path.join(
                tmp2Path,
                basename + '-' + colorName + '.svg'
              );

              return makePng(svgPath, file.dest);
            });
          });
        })
        .then(function() {
          return fs.removeAsync(tempPath);
        })
        .then(function() {
          return Promise.resolve('Done!');
        })
        .then(grunt.log.write);
    }
  );
};
