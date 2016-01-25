var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('images', function () {

    if (process.argv[3] === '--zh'||process.argv[3] === '--all') {
        gulp.src('src/images/**/*', !'src/images/**/*.psd')
            .pipe(gulp.dest('public2/images'))
            .pipe($.size({title: 'images'}));
    }

    if(process.argv[3] !== '--zh'){
        gulp.src('src/images/**/*', !'src/images/**/*.psd')
            .pipe(gulp.dest('public/images'))
            .pipe($.size({title: 'images'}));
    }
});