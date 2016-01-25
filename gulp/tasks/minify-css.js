var gulp = require('gulp');
var minifyCSS = require('gulp-minify-css');
var config = require('../config').minifycss;

gulp.task('minify-css', function () {

    if (process.argv[3] === '--zh'||process.argv[3] === '--all') {
        gulp.src(config.src)
            .pipe(minifyCSS({keepBreaks: true}))
            .pipe(gulp.dest(config.dest_zh));
    }

    if(process.argv[3] !== '--zh') {
        gulp.src(config.src)
            .pipe(minifyCSS({keepBreaks: true}))
            .pipe(gulp.dest(config.dest_en));
    }
});