var gulp = require('gulp');
var supervisor = require("gulp-supervisor");
var config = require('../config').serve;
var livereload = require('gulp-livereload');
var chokidar = require('chokidar');

gulp.task('serve', function () {
    livereload.listen({port: 35728});

    chokidar.watch(config.watch).on('change', function(filename) {
        console.log("change: "+filename);
        livereload.reload();
    });

    supervisor(config.main, config.supervisor);
});