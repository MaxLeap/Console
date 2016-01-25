var gulp = require("gulp"),
    config = require("./config"),
    browserSync = require("browser-sync").create();

//自动刷新
gulp.task('browser-sync', ['serve'], function() {
    browserSync.init({
        proxy: "localhost:8888"
    });
    gulp.watch(config.browserSync.watch).on('change', browserSync.reload);
});
