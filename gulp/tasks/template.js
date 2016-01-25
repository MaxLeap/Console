var gulp = require('gulp');
var ejs = require("gulp-ejs");
var config = require('../config').template;

gulp.task('template', function () {
    var version = (new Date()).getTime();

    if (process.argv[3] === '--zh'||process.argv[3] === '--all') {
        var data = JSON.parse(JSON.stringify(config.data));
        data.locale = "zh";
        data.version = version;
        gulp.src(config.module_src)
            .pipe(ejs(data))
            .pipe(gulp.dest(config.dest_zh));

        gulp.src(config.other_src)
            .pipe(ejs(data))
            .pipe(gulp.dest(config.dest_zh));
    }

    if(process.argv[3] !== '--zh'){

        var data2 = JSON.parse(JSON.stringify(config.data));
        data2.locale = "en";
        data2.version = version;
        gulp.src(config.module_src)
            .pipe(ejs(data2))
            .pipe(gulp.dest(config.dest_en));

        gulp.src(config.other_src)
            .pipe(ejs(data2))
            .pipe(gulp.dest(config.dest_en));
    }
});