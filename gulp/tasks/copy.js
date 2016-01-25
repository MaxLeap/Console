var gulp = require('gulp');
var exec = require('child_process').exec;
var $ = require('gulp-load-plugins')();
var config = require('../config').copy;

function copy_file(locale,callback){
    var dest = locale =="zh"?config.dest_zh:config.dest_en;

    gulp.src(['src/*.swf'], {base: config.src})
        .pipe(gulp.dest(dest))
        .pipe($.size({title: 'copy:swf'}));

    gulp.src(['src/*.swf','src/stylesheets/*.*', 'src/fonts/**/*.*'], {base: config.src})
        .pipe(gulp.dest(dest))
        .pipe($.size({title: 'copy:css'}));

    exec('cp -R src/javascript/lib/ '+dest+'javascript/lib&&cp -R src/javascript/vendor/ '+dest+'javascript/vendor',function(){
        if(callback)callback();
    });
    exec('mkdir -p '+dest+'locales&&cp -R src/locales/ '+dest+'locales');
    exec('mkdir -p '+dest+'semanticui&&cp -R src/semanticui/dist/ '+dest+'semanticui/dist');
    exec('mkdir -p '+dest+'tinymce/js/tinymce/skins&&cp -R src/tinymce/js/tinymce/skins/ '+dest+'tinymce/js/tinymce/skins');
    exec('mkdir -p '+dest+'tinymce/js/tinymce/langs&&cp -R src/tinymce/js/tinymce/langs/ '+dest+'tinymce/js/tinymce/langs');
    exec('cp -R src/tinymce/js/tinymce/tinymce.full.min.js '+dest+'tinymce/js/tinymce');
}

gulp.task('copy', function () {
    if (process.argv[3] === '--zh'){
        copy_file("zh",function(){
            exec('cp -R public/javascript/ public2/javascript');
        });
    }else if(process.argv[3] === '--en'||!process.argv[3]){
        copy_file("en");
    }else if(process.argv[3] === '--all'){
        copy_file("en",function(){
            copy_file("zh",function(){
                exec('cp -R public/javascript/ public2/javascript');
            });
        });
    }
});