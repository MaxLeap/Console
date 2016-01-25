var gulp = require('gulp');
var del = require('del');
var config = require('../config').clean;

if (process.argv[3] === '--zh'||process.argv[3] === '--all') {
    gulp.task('clean', del.bind(null, config.zh_dir));
}
if(process.argv[3] !== '--zh'){
    gulp.task('clean', del.bind(null, config.en_dir));
}