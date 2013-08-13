module.exports = function (grunt) {

	grunt.initConfig({
		bower: {
			install: {
				options: {
					targetDir: './public/js/vendors/',
					layout: 'byComponent',
					install: true,
					verbose: true,
					cleanTargetDir: true,
					cleanBowerDir: true
				}
			}
		},
		less: {
			default: {
				files: {
					'public/css/main.css': 'less/main.less'
				},
				options: {
					paths: [ 'less/basics', 'less/pages', 'less/parts' ]
				}
			}
		},

		autoprefixer: {
			options: {
				browsers: ['last 5 versions', '> 1%', 'ie 8', 'ie 7']
			},
			dist: {
				files: {
					'public/css/main.css': 'public/css/main.css'
				}
			}
		},

		cssmin: {
			default: {
				options: {
					report: 'min'
				},
				files: {
					'public/css/main.css': ['public/css/main.css']
				}
			}
		},

		watch: {
			files: 'less/**/*.less',
			tasks: ['build']
		}
	})

	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['build']);
	grunt.registerTask('build', ['less', 'autoprefixer']);
	grunt.registerTask('build:production', ['less', 'autoprefixer', 'cssmin']);
};
