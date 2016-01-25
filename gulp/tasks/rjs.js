var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('rjs', function (cb) {
    exec('sh build.sh', function (err) {
        if (err) return cb(err); //return error
        cb(); // finished task
    });
});