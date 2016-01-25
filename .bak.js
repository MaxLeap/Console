'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
//var browserSync = require('browser-sync');
//var pagespeed = require('psi');
var ejs = require("gulp-ejs");
//var replace = require("gulp-replace");
//var reload = browserSync.reload;
var supervisor = require("gulp-supervisor");
var gulpif = require('gulp-if');
var sprite = require('css-sprite').stream;


gulp.task('build', ['clean'], function (cb) {
    runSequence('styles:all', ['images', 'rjs', 'template'],'copy', 'minify-css', cb);
});

gulp.task('default', function (cb) {
    runSequence('serve', cb);
});

gulp.task('sprites', function () {
    function singleSprite(flag, ratio){
        gulp.src(['src/images/sicons'+flag+'/*.png'])
            .pipe(sprite({
                name: 'sprite'+flag,
                style: '_sprite'+flag+'.scss',
                cssPath: '/images/',
                processor: 'scss',
                margin: 5 * ratio,
                orientation: 'binary-tree',
                prefix: 'sicon'
            }))
            .pipe(gulpif('*.png', gulp.dest('src/images'), gulp.dest('src/scss/')))
    }
    singleSprite('', 1);
});
