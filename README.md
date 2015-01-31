# grunt-svg2png-colorfy

Grunt plugin to rasterize SVG to PNG images with different colors

## Getting Started
This plugin requires [Grunt](http://gruntjs.com/) `~0.4.5`

````javascript
// Gruntfile.js configuration
grunt.loadNpmTasks('grunt-svg2png-colorfy');

grunt.initConfig({
	svg2png_colorfy: {
		all: {
			options: {
				// A hash of colors to pass in with names
				colors: {
					primary: '#FF0000'
				}
			},
			// Specify files in array format with multiple src-dest mapping
			files: [
				// Rasterize all SVG files in "img" and its subdirectories to "img/png"
				{cwd: 'img/', src: ['**/*.svg'], dest: 'img/png/'}
			]
		}
	}
});
````

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 0.1.0 First release

## Credits
* Test icons by [IcoMoon](https://icomoon.io) (CC BY 4.0 or GPL)

## License
Copyright (c) 2015 Hein Bekker. Licensed under the MIT license.
