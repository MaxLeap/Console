var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('styles:all', function(){
    return gulp.src('src/scss/modules/*.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['src/scss']
        }))
        .on('error', console.error.bind(console))
        .pipe(gulp.dest('src/stylesheets'))
        .pipe($.size({title: 'styles:all'}));
});

gulp.task('styles:bootstrap', function(){
    return gulp.src('src/scss/bootstrap.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['src/scss']
        }))
        .on('error', console.error.bind(console))
        .pipe(gulp.dest('src/stylesheets'))
        .pipe($.size({title: 'styles:bootstrap'}));
});