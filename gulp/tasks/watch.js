var gulp = require('gulp');
var del = require('del');
var config = require('../config').watch;
var $ = require('gulp-load-plugins')();

gulp.task('watch', function(){

    gulp.watch(['src/scss/*.scss','src/scss/modules/*/*.scss','src/scss/util/*.scss'], ['styles:all']);

    gulp.watch(['src/scss/modules/*.scss'], function(event){
        /(\w+)\.scss/.test(event.path);
        var module = RegExp.$1;
        return gulp.src(event.path)
            .pipe($.rubySass({
                style: 'expanded',
                precision: 10,
                loadPath: ['src/scss']
            }))
            .on('error', console.error.bind(console))
            .pipe(gulp.dest('src/stylesheets'))
            .pipe($.size({title: 'styles:'+module}));
    });
});

