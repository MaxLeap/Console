var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', ['clean'], function (cb) {
    runSequence('styles:all', ['images', 'rjs', 'template'],'copy', 'minify-css', cb);
});